import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Cloudinary configuration is automatically picked up from process.env.CLOUDINARY_URL

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;

    const contentLength = request.headers.get('content-length');
    if (!contentLength) {
      return NextResponse.json({ success: false, error: 'Length Required. Chunked encoding is not permitted.' }, { status: 411 });
    }
    if (parseInt(contentLength, 10) > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Payload Too Large. Maximum size is 50MB.' }, { status: 413 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cloudinary credentials are not configured on this server.' 
      }, { status: 501 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pdf-manager/${email}`,
          resource_type: 'image', // Cloudinary natively handles PDFs under 'image' and serves correct application/pdf MIME type
          public_id: file.name.replace(/\.[^/.]+$/, "") + "_" + Date.now(), // Unique filename
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      message: 'File successfully uploaded to Cloudinary',
      result: uploadResult 
    });

  } catch (error: any) {
    console.error('Error in cloudinary POST API:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred while processing your request.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.CLOUDINARY_URL) {
      return NextResponse.json({ success: false, error: 'Cloudinary not configured' }, { status: 501 });
    }

    const email = session.user.email;
    const folder = `pdf-manager/${email}`;

    // Fetch files natively as images (which includes PDFs)
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${folder}/`,
      resource_type: 'image',
      max_results: 50,
      direction: 'desc'
    });

    const files = result.resources.map((file: any) => {
      // Extract filename from public_id and append .pdf for UI display
      const name = file.public_id.split('/').pop() + ".pdf";
      return {
        id: file.public_id,
        name: name,
        url: file.secure_url,
        date: new Date(file.created_at).toISOString().split('T')[0],
        size: file.bytes
      };
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error('Error in cloudinary GET API:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const body = await request.json();
    const publicId = body.public_id;

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'public_id is required' }, { status: 400 });
    }

    if (!publicId.startsWith(`pdf-manager/${email}/`)) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this file.' }, { status: 403 });
    }

    // Default destroy uses image resource_type
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in cloudinary DELETE API:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
  }
}
