'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Listing } from '@/types';

interface ListingGalleryProps {
  listing: Listing;
}

export function ListingGallery({ listing }: ListingGalleryProps) {
  return (
    <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800/50 group shadow-2xl shadow-black/50">
      <Image 
        src={listing.images[0]} 
        alt={listing.title} 
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-105"
        referrerPolicy="no-referrer"
        priority
      />
      <div className="absolute top-8 left-8 flex space-x-4">
        <Badge variant="gold" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/50">
          {listing.gameId}
        </Badge>
        <Badge variant="default" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50">
          {listing.categoryId}
        </Badge>
      </div>
    </div>
  );
}
