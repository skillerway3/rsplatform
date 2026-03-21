import { Hero } from '@/components/home/Hero';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { Features } from '@/components/home/Features';
import { LISTINGS } from '@/data/mock';

export default function HomePage() {
  const featuredListings = LISTINGS.filter(l => l.isFeatured);

  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedListings listings={featuredListings} />
      <Features />
    </div>
  );
}
