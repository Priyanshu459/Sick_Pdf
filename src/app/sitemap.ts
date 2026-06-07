import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdfmaster.rooted-feed.online';

  const routes = [
    '',
    '/merge',
    '/split',
    '/compress',
    '/convert',
    '/convert/pdf-to-word',
    '/convert/pdf-to-excel',
    '/convert/jpg-to-pdf',
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
