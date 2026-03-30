import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://rsplatform.gg';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/auth/',
        '/support/chat/',
        '/messages/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
