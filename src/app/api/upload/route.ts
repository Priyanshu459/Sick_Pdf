import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) {
      return NextResponse.json({ success: false, error: 'Length Required. Chunked encoding is not permitted.' }, { status: 411 });
    }
    if (parseInt(contentLength, 10) > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Payload Too Large. Maximum size is 50MB.' }, { status: 413 });
    }

    // Read form data strictly to trigger parsing errors if malformed,
    // but do not process or save it to disk.
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Since this is a scaffold endpoint originally designed for local storage,
    // we return a 501 Not Implemented to fail gracefully and prevent disk exhaustion (Storage DoS).
    // Production deployments should use /api/cloudinary or direct S3 uploads.
    return NextResponse.json({ 
      success: false, 
      error: `Server Error: Local disk uploads via /api/upload have been disabled for security (Storage DoS mitigation). Please use a cloud storage provider integration.` 
    }, { status: 501 });

  } catch (error: any) {
    console.error('Error in upload API:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred while processing your request.' }, { status: 500 });
  }
}
