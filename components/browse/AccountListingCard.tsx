'use client';

import React from 'react';
import { Listing } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Clock,
  Package,
  Star,
  ChevronRight,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface AccountListingCardProps {
  listing: Listing;
}

type SellerLike = {
  avatar?: string | null;
  username?: string | null;
  isVerified?: boolean;
  rating?: string | number | null;
  totalSales?: number | null;
};

type MetadataLike = {
  build?: string | null;
  totalLevel?: string | number | null;
  type?: string | null;
  loginMethod?: string | null;
  highlights?: string[] | null;
};

type ListingWithExtras = Listing & {
  images?: unknown;
  seller?: SellerLike;
  metadata?: MetadataLike;
  gameId?: string | null;
  deliveryTime?: string | null;
};

export function AccountListingCard({ listing }: AccountListingCardProps) {
  const safeListing = listing as ListingWithExtras;

  const seller: SellerLike | undefined = safeListing.seller;
  const metadata: MetadataLike | undefined = safeListing.metadata;

  const rawImages = safeListing.images;

  const images: string[] = Array.isArray(rawImages)
    ? rawImages.filter(
        (img): img is string => typeof img === 'string' && img.trim().length > 0
      )
    : [];

  const mainImage = images.length > 0 ? images[0] : null;

  const sellerAvatar =
    typeof seller?.avatar === 'string' && seller.avatar.trim().length > 0
      ? seller.avatar
      : null;

  const highlights: string[] = Array.isArray(metadata?.highlights)
    ? metadata.highlights.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      )
    : [];

  return (
    <Link href={`/listing/${safeListing.id}`}>
      <Card className="overflow-hidden border-zinc-800/50 bg-zinc-950/40 group hover:border-amber-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-3 aspect-[16/10] lg:aspect-auto relative bg-zinc-900 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800/50">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={safeListing.title || 'Listing image'}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                <Package className="w-16 h-16 opacity-10" />
              </div>
            )}

            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <div className="bg-black/80 border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                  {safeListing.gameId || 'Game'}
                </span>
              </div>
            </div>

            {metadata?.build && (
              <div className="absolute bottom-4 left-4 z-10">
                <div className="bg-amber-500 text-black px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {metadata.build}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-100 group-hover:text-amber-500 transition-colors duration-300 leading-tight">
                  {safeListing.title || 'Untitled Listing'}
                </h3>
              </div>

              {metadata && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      Total Level
                    </p>
                    <p className="text-sm font-bold text-zinc-300 font-mono">
                      {metadata.totalLevel ?? '-'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      Type
                    </p>
                    <p className="text-sm font-bold text-zinc-300 font-mono">
                      {metadata.type ?? '-'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      Login
                    </p>
                    <p className="text-sm font-bold text-zinc-300 font-mono truncate">
                      {metadata.loginMethod ?? '-'}
                    </p>
                  </div>
                </div>
              )}

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {highlights.slice(0, 3).map((highlight: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 px-3 py-1.5 rounded-lg"
                    >
                      <CheckCircle2 className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 relative rounded-xl overflow-hidden border border-zinc-800 shadow-lg bg-zinc-900 flex items-center justify-center">
                  {sellerAvatar ? (
                    <Image
                      src={sellerAvatar}
                      alt={seller?.username || 'Seller'}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Package className="w-4 h-4 text-zinc-700" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">
                      {seller?.username || 'Seller'}
                    </span>
                    {seller?.isVerified && (
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{seller?.rating ?? 'N/A'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                      {seller?.totalSales ?? 0} Sales
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-1">
                <Badge className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                  Instant Delivery
                </Badge>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 p-8 flex flex-col justify-between bg-zinc-950/20 relative">
            <div className="text-right lg:text-left">
              <div className="inline-block lg:block">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">
                  Market Price
                </p>
                <div className="flex items-baseline justify-end lg:justify-start gap-1">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {formatCurrency(safeListing.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-8 lg:mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-end lg:justify-start gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{safeListing.deliveryTime || 'Fast'} Delivery</span>
                </div>

                <div className="flex items-center justify-end lg:justify-start gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>RSPlatform Secure</span>
                </div>
              </div>

              <div className="group/btn relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-20 group-hover/btn:opacity-40 transition duration-500" />
                <div className="relative w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300">
                  View Account
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}