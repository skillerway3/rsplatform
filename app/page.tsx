import { Hero } from '@/components/home/Hero';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { Features } from '@/components/home/Features';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedListings />
      <Features />
    </div>
  );
}
