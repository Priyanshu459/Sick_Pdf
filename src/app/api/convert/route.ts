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

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ success: false, error: 'File and type are required' }, { status: 400 });
    }

    // Since we are building an enterprise-grade app but the required LibreOffice 
    // binary (Gotenberg) is not installed locally by default on Windows development machines,
    // we return a 501 Not Implemented to fail gracefully.
    return NextResponse.json({ 
      success: false, 
      error: `Server Error: Complex document conversion (${type}) requires a Gotenberg API (LibreOffice) instance or a premium 3rd-party conversion API. Neither are currently configured on this server.` 
    }, { status: 501 });

  } catch (error: any) {
    console.error('Error in convert API:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred while processing your request.' }, { status: 500 });
  }
}
