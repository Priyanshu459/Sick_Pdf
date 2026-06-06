import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.CLOUDINARY_URL) {
      return NextResponse.json({ success: false, error: 'Cloudinary credentials missing.' }, { status: 501 });
    }

    const email = session.user.email;
    const body = await request.json();
    const { provider, fileName, url, fileId, accessToken } = body;

    if (!provider || !fileName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let fileBuffer: Buffer;

    if (provider === 'dropbox') {
      if (!url) return NextResponse.json({ success: false, error: 'Missing Dropbox URL' }, { status: 400 });
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Dropbox fetch failed: ${response.statusText}`);
      fileBuffer = Buffer.from(await response.arrayBuffer());
    } else if (provider === 'google') {
      if (!fileId || !accessToken) return NextResponse.json({ success: false, error: 'Missing Google Drive credentials' }, { status: 400 });
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error(`Google Drive fetch failed: ${response.statusText}`);
      fileBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported provider' }, { status: 400 });
    }

    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pdf-manager/${email}`,
          resource_type: 'image', // For PDFs, use image so Cloudinary serves correct application/pdf MIME type
          format: 'pdf', // Explicitly force Cloudinary to process and serve this as a PDF document
          public_id: fileName.replace(/\.[^/.]+$/, "") + "_" + Date.now(), // Unique filename
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return NextResponse.json({ 
      success: true, 
      message: `File successfully imported from ${provider}`,
      result: uploadResult 
    });

  } catch (error: any) {
    console.error('Error in cloud-import API:', error);
    return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
