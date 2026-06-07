import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/cloud', '/api/'],
    },
    sitemap: 'https://pdfmaster.rooted-feed.online/sitemap.xml',
  };
}
