import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/ListingCard';
import { Listing } from '@/types';

interface FeaturedListingsProps {
  listings: Listing[];
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  return (
    <section className="py-32 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Market Activity</div>
            <h2 className="text-5xl font-black text-zinc-100 tracking-tighter uppercase">Featured Inventory</h2>
          </div>
          <Link href="/browse">
            <Button variant="ghost" className="text-zinc-500 hover:text-amber-500 font-black uppercase tracking-widest text-[10px]">
              View All Listings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
