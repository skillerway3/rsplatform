'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Listing } from '@/types';
import { Package } from 'lucide-react';

interface ListingGalleryProps {
  listing: Listing;
}

type ListingWithExtras = Listing & {
  images?: unknown;
  gameId?: string | null;
  categoryId?: string | null;
  title?: string | null;
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const safeListing = listing as ListingWithExtras;

  const images: string[] = Array.isArray(safeListing.images)
    ? safeListing.images.filter(
        (img): img is string => typeof img === 'string' && img.trim().length > 0
      )
    : [];

  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800/50 group shadow-2xl shadow-black/50">
      {mainImage ? (
        <Image
          src={mainImage}
          alt={safeListing.title || 'Listing image'}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
          <Package className="w-16 h-16 opacity-20" />
        </div>
      )}

      <div className="absolute top-8 left-8 flex space-x-4">
        <Badge
          variant="gold"
          className="px-6 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/50"
        >
          {safeListing.gameId || 'Game'}
        </Badge>

        <Badge
          variant="default"
          className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black/60 border-white/10 shadow-2xl shadow-black/50"
        >
          {safeListing.categoryId || 'Category'}
        </Badge>
      </div>
    </div>
  );
}