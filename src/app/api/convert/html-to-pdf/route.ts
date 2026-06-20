import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { type, content } = await request.json();

    if (!type || !content) {
      return NextResponse.json({ success: false, error: 'Type and content are required' }, { status: 400 });
    }

    if (type !== 'url' && type !== 'html') {
      return NextResponse.json({ success: false, error: 'Type must be "url" or "html"' }, { status: 400 });
    }

    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    // SSRF Protection: Block internal and local network requests
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      try {
        const reqUrl = new URL(interceptedRequest.url());
        const hostname = reqUrl.hostname;
        
        // Check for local/private IP ranges or file protocol
        const isLocal = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname === '::1' ||
                        hostname === '169.254.169.254' ||
                        hostname.startsWith('10.') ||
                        hostname.startsWith('192.168.') ||
                        (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31);
        
        if (reqUrl.protocol === 'file:' || isLocal) {
          console.warn(`Blocked SSRF attempt to: ${reqUrl.href}`);
          interceptedRequest.abort('accessdenied');
        } else {
          interceptedRequest.continue();
        }
      } catch (e) {
        interceptedRequest.abort('failed');
      }
    });

    // To prevent abuse, block navigation or excessive loading for raw HTML
    if (type === 'html') {
      // Disable JS for raw HTML snippets to prevent XSS data exfiltration
      await page.setJavaScriptEnabled(false);
      await page.setContent(content, { waitUntil: 'load', timeout: 30000 });
    } else {
      // Basic URL validation
      let urlStr = content;
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        urlStr = 'https://' + urlStr;
      }
      const url = new URL(urlStr);
      
      const hostname = url.hostname;
      const isLocal = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname === '::1' ||
                      hostname === '169.254.169.254' ||
                      hostname.startsWith('10.') ||
                      hostname.startsWith('192.168.') ||
                      (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31);
                      
      if (url.protocol === 'file:' || isLocal) {
        throw new Error("Access to local or internal network resources is forbidden.");
      }

      await page.goto(url.href, { waitUntil: 'networkidle0', timeout: 30000 });
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="converted.pdf"`);
    
    return response;

  } catch (error: any) {
    console.error('Error in HTML to PDF conversion:', error);
    if (browser) {
      await browser.close().catch(console.error);
    }
    return NextResponse.json({ success: false, error: error.message || 'An error occurred during conversion' }, { status: 500 });
  }
}
