import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  let inputFilepath = '';
  let outputFilepath = '';

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
    const level = data.get('level') as string || 'ebook';

    if (!file || typeof file === 'string' || !file.size) {
      return NextResponse.json({ success: false, error: 'A valid PDF file object is required.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const allowedLevels = ['screen', 'ebook', 'printer', 'prepress'];
    if (!allowedLevels.includes(level)) {
      return NextResponse.json({ success: false, error: 'Invalid compression level' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.subarray(0, 4).toString() !== '%PDF') {
      return NextResponse.json({ success: false, error: 'Invalid file format. Only PDF files are allowed.' }, { status: 400 });
    }

    const uniqueId = crypto.randomUUID();
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    inputFilepath = join(uploadDir, `${uniqueId}_input.pdf`);
    outputFilepath = join(uploadDir, `${uniqueId}_output.pdf`);
    
    await writeFile(inputFilepath, buffer);

    // Try to compress using Ghostscript
    // levels map to gs -dPDFSETTINGS
    // screen = 72 dpi, ebook = 150 dpi, printer = 300 dpi
    try {
      const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
      await execFileAsync(gsCommand, [
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=/${level}`,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputFilepath}`,
        inputFilepath
      ], { timeout: 15000 });
    } catch (execError: any) {
      console.error('Ghostscript Error:', execError);
      
      if (execError.message.includes('not recognized') || execError.code === 127 || execError.message.includes('ENOENT')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Server Error: Ghostscript is not installed on the server. Please install Ghostscript (gs) to use PDF compression.' 
        }, { status: 501 });
      }
      
      throw new Error('Failed to compress PDF');
    }

    const outputBuffer = await readFile(outputFilepath);

    const response = new NextResponse(outputBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="compressed.pdf"`);
    
    return response;

  } catch (error: any) {
    console.error('Error in compress API:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred while processing your request.' }, { status: 500 });
  } finally {
    try {
      if (inputFilepath && existsSync(inputFilepath)) await unlink(inputFilepath);
      if (outputFilepath && existsSync(outputFilepath)) await unlink(outputFilepath);
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }
  }
}
