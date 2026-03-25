import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://rsplatform.gg';
  const supabase = createClient();

  // Fetch all active listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active');

  // Static routes
  const routes = [
    '',
    '/browse',
    '/marketplace',
    '/marketplace/requests',
    '/marketplace/submit',
    '/sell',
    '/support',
    '/support/contact',
    '/support/legal',
    '/support/safety',
    '/trust',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic listing routes
  const listingRoutes = (listings || []).map((listing) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: new Date(listing.updated_at).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...listingRoutes];
}
