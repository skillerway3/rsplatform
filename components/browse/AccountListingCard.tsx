'use client';

import React from 'react';
import { Listing, User } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Clock, Package, Star, Zap, ChevronRight, CheckCircle2, Trophy, UserCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { USERS } from '@/data/mock';

interface AccountListingCardProps {
  listing: Listing;
}

export function AccountListingCard({ listing }: AccountListingCardProps) {
  const seller = listing.seller;
  const metadata = listing.metadata;

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden border-zinc-800/50 bg-zinc-950/40 backdrop-blur-md group hover:border-amber-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image Section */}
          <div className="lg:col-span-3 aspect-[16/10] lg:aspect-auto relative bg-zinc-900 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800/50">
            {listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                <Package className="w-16 h-16 opacity-10" />
              </div>
            )}
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{listing.gameId}</span>
              </div>
            </div>
            
            {/* Build Badge - Bottom Left */}
            {metadata && (
              <div className="absolute bottom-4 left-4 z-10">
                <div className="bg-amber-500 text-black px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {metadata.build}
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800/50 relative overflow-hidden">
            {/* Subtle Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-100 group-hover:text-amber-500 transition-colors duration-300 leading-tight">
                  {listing.title}
                </h3>
              </div>
              
              {/* Technical Specs Grid */}
              {metadata && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Total Level</p>
                    <p className="text-sm font-bold text-zinc-300 font-mono">{metadata.totalLevel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Type</p>
                    <p className="text-sm font-bold text-zinc-300 font-mono">{metadata.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Login</p>
                    <p className="text-sm font-bold text-zinc-300 font-mono truncate">{metadata.loginMethod}</p>
                  </div>
                </div>
              )}

              {/* Highlights with Icons */}
              {metadata?.highlights && metadata.highlights.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {metadata.highlights.slice(0, 3).map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Trust Bar */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 relative rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                  <Image 
                    src={seller?.avatar || ''} 
                    alt={seller?.username || 'Seller'} 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-200 uppercase tracking-wider">{seller?.username}</span>
                    {seller?.isVerified && (
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{seller?.rating}</span>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{seller?.totalSales} Sales</span>
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

          {/* Price & Action Section */}
          <div className="lg:col-span-3 p-8 flex flex-col justify-between bg-zinc-950/20 relative">
            <div className="text-right lg:text-left">
              <div className="inline-block lg:block">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">Market Price</p>
                <div className="flex items-baseline justify-end lg:justify-start gap-1">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {formatCurrency(listing.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-8 lg:mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-end lg:justify-start gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{listing.deliveryTime} Delivery</span>
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
