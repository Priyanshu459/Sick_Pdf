import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdfmaster.rooted-feed.online';

  const routes = [
    '',
    '/merge',
    '/split',
    '/compress',
    '/convert',
    '/convert/word-to-pdf',
    '/convert/excel-to-pdf',
    '/convert/ppt-to-pdf',
    '/convert/pdf-to-word',
    '/convert/pdf-to-excel',
    '/convert/pdf-to-ppt',
    '/convert/jpg-to-pdf',
    '/convert/pdf-to-jpg',
    '/edit',
    '/watermark',
    '/page-numbers',
    '/sign',
    '/protect',
    '/unlock',
    '/ocr',
    '/organize',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
