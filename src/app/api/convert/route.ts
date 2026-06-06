import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  let inputFilepath = '';
  let outputFilepath = '';
  let loProfilePath = '';

  try {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) {
      return NextResponse.json({ success: false, error: 'Length Required. Chunked encoding is not permitted.' }, { status: 411 });
    }
    if (parseInt(contentLength, 10) > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Payload Too Large. Maximum size is 50MB.' }, { status: 413 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string;

    if (!file || typeof file === 'string' || !file.size || !type) {
      return NextResponse.json({ success: false, error: 'A valid file and type are required.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    if (type.startsWith('pdf-to-') && type !== 'pdf-to-word' && type !== 'pdf-to-jpg') {
      return NextResponse.json({ 
        success: false, 
        error: `Server Error: PDF to Office conversion requires a paid 3rd-party OCR/conversion API. We currently only support PDF to Word and PDF to JPG.` 
      }, { status: 501 });
    }

    const originalExtension = file.name.split('.').pop() || '';
    if (!originalExtension) {
      return NextResponse.json({ success: false, error: 'File must have a valid extension.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = crypto.randomUUID();
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // LibreOffice needs the correct input extension to understand the format
    inputFilepath = join(uploadDir, `${uniqueId}_input.${originalExtension}`);
    loProfilePath = join(uploadDir, `${uniqueId}_lo_profile`).replace(/\\/g, '/');
    
    await writeFile(inputFilepath, buffer);

    if (type === 'pdf-to-word') {
      outputFilepath = join(uploadDir, `${uniqueId}_output.docx`);
      try {
        const scriptPath = join(process.cwd(), 'src', 'scripts', 'pdf2word.py');
        await execFileAsync('python3', [scriptPath, inputFilepath, outputFilepath], { timeout: 60000 });
      } catch (execError: any) {
        console.error('Python PDF2Word Error:', execError);
        throw new Error('Failed to convert PDF to Word');
      }
    } else if (type === 'pdf-to-jpg') {
      outputFilepath = join(uploadDir, `${uniqueId}_output.zip`);
      const jpgDir = join(uploadDir, `${uniqueId}_jpgs`);
      try {
        if (!existsSync(jpgDir)) {
          await mkdir(jpgDir, { recursive: true });
        }
        // Extract to JPGs using Ghostscript
        const jpgPattern = join(jpgDir, 'page_%03d.jpg').replace(/\\/g, '/');
        const inputForGs = inputFilepath.replace(/\\/g, '/');
        await execFileAsync('gs', [
          '-dNOPAUSE',
          '-sDEVICE=jpeg',
          '-r300',
          '-dJPEGQ=90',
          `-sOutputFile=${jpgPattern}`,
          inputForGs,
          '-c',
          'quit'
        ], { timeout: 60000 });
        
        // Read generated files to pass to zip
        const fsPromises = require('fs/promises');
        const files = await fsPromises.readdir(jpgDir);
        const filePaths = files.map((f: string) => join(jpgDir, f));
        
        // Zip the directory
        await execFileAsync('zip', [
          '-j', // junk paths (don't include directory structure)
          outputFilepath,
          ...filePaths
        ], { timeout: 30000 });
      } catch (execError: any) {
        console.error('PDF to JPG Error:', execError);
        throw new Error('Failed to convert PDF to JPG');
      } finally {
        if (existsSync(jpgDir)) await rm(jpgDir, { recursive: true, force: true });
      }
    } else {
      try {
        const isWin = process.platform === 'win32';
        const fileUriPrefix = isWin ? 'file:///' : 'file://';
        const loCommand = isWin ? 'soffice' : 'libreoffice';
        
        await execFileAsync(loCommand, [
          // Crucial: Use a unique user profile to allow concurrent conversions!
          `-env:UserInstallation=${fileUriPrefix}${loProfilePath}`,
          '--headless',
          '--convert-to',
          'pdf',
          inputFilepath,
          '--outdir',
          uploadDir
        ], { timeout: 30000 }); // 30 second timeout for heavy PPTs
      } catch (execError: any) {
        console.error('LibreOffice Error:', execError);
        
        if (execError.message.includes('not recognized') || execError.code === 127 || execError.message.includes('ENOENT')) {
          return NextResponse.json({ 
            success: false, 
            error: 'Server Error: LibreOffice is not installed on the server.' 
          }, { status: 501 });
        }
        
        throw new Error('Failed to convert document');
      }
  
      // LibreOffice saves the output file with the same base name but .pdf extension
      outputFilepath = join(uploadDir, `${uniqueId}_input.pdf`);
    }

    if (!existsSync(outputFilepath)) {
      throw new Error('Converted PDF not found');
    }

    const outputBuffer = await readFile(outputFilepath);

    const response = new NextResponse(outputBuffer);
    
    if (type === 'pdf-to-word') {
      response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      response.headers.set('Content-Disposition', `attachment; filename="converted.docx"`);
    } else if (type === 'pdf-to-jpg') {
      response.headers.set('Content-Type', 'application/zip');
      response.headers.set('Content-Disposition', `attachment; filename="images.zip"`);
    } else {
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', `attachment; filename="converted.pdf"`);
    }
    
    return response;

  } catch (error: any) {
    console.error('Error in convert API:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred while processing your request.' }, { status: 500 });
  } finally {
    try {
      if (inputFilepath && existsSync(inputFilepath)) await unlink(inputFilepath);
      if (outputFilepath && existsSync(outputFilepath)) await unlink(outputFilepath);
      if (loProfilePath && existsSync(loProfilePath)) await rm(loProfilePath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }
  }
}
