'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface SellStepReviewProps {
  formData: {
    title: string;
    description: string;
    price: string;
    stock: string;
    deliveryTime: string;
    deliveryMethod: string;
    gameId: string;
    categoryId: string;
  };
  gameName?: string;
  categoryName?: string;
}

export function SellStepReview({ formData, gameName, categoryName }: SellStepReviewProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">7</span>
          Final Review
        </h2>
        <div className="space-y-6">
          <Card className="p-8 border-zinc-800 bg-zinc-900/30 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Game</p>
                <p className="text-white font-medium">{gameName || 'Not selected'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Category</p>
                <p className="text-white font-medium">{categoryName || 'Not selected'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Price</p>
                <p className="text-amber-500 font-bold">${formData.price || '0.00'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Stock</p>
                <p className="text-white font-medium">{formData.stock || '0'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Listing Title</p>
              <p className="text-lg text-white">{formData.title || 'No title provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Delivery Time</p>
                <p className="text-white font-medium">{formData.deliveryTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Delivery Method</p>
                <p className="text-white font-medium">{formData.deliveryMethod}</p>
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Buyer Protection Enabled</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your listing is automatically covered by our RSPlatform Guarantee. Funds are held securely until the buyer confirms delivery.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex gap-4">
            <AlertCircle className="w-6 h-6 text-zinc-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Terms of Service</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                By publishing this listing, you agree to our Marketplace Terms of Service. Any attempt to trade outside the platform will result in a permanent ban.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
