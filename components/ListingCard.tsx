'use client';

import Link from 'next/link';
import { ShieldCheck, Zap, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/listing/${listing.id}`}>
        <Card className="premium-card group overflow-hidden h-full">
          <div className="aspect-video relative overflow-hidden bg-zinc-900 flex items-center justify-center">
            <Package className="w-12 h-12 text-zinc-800" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-zinc-950/80 px-3 py-1 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-amber-500 w-fit">
                {listing.gameId}
              </div>
              {listing.seller?.isVerified && (
                <div className="bg-emerald-500/90 px-2 py-1 rounded-lg border border-emerald-400/20 text-[7px] font-black uppercase tracking-widest text-white flex items-center gap-1 w-fit">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-zinc-100 tracking-tight uppercase group-hover:text-amber-500 transition-colors">
                {listing.title}
              </h3>
            </div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3 mr-1" />
                {listing.deliveryTime}
              </div>
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
              <div className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                {listing.deliveryMethod}
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="text-2xl font-black text-zinc-100 tracking-tighter">
                {formatCurrency(listing.price)}
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
