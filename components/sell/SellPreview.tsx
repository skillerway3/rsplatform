'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Clock, Package } from 'lucide-react';

interface SellPreviewProps {
  formData: {
    title: string;
    price: string;
    stock: string;
    deliveryTime: string;
    gameId: string;
    categoryId: string;
    images: string[];
    accountMetadata?: {
      build: string;
      type: string;
      loginMethod: string;
      totalLevel: string;
      tags: string[];
    };
  };
  gameName?: string;
  categoryName?: string;
}

export function SellPreview({ formData, gameName, categoryName }: SellPreviewProps) {
  const isAccount = formData.categoryId === 'accounts';
  const metadata = formData.accountMetadata;

  return (
    <div className="sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500">Live Preview</h3>
        <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">Draft</Badge>
      </div>
      
      <Card className="overflow-hidden border-zinc-800 bg-zinc-900 group">
        <div className="aspect-[4/3] relative bg-zinc-800/50 overflow-hidden">
          {formData.images.length > 0 ? (
            <Image
              src={formData.images[0]}
              alt="Preview"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
              <Package className="w-12 h-12 opacity-20" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {gameName && (
              <Badge className="bg-black/80 border-white/10 text-white font-medium">
                {gameName}
              </Badge>
            )}
            {categoryName && (
              <Badge className="bg-amber-500 border-none text-black font-bold">
                {categoryName}
              </Badge>
            )}
          </div>
          {isAccount && metadata?.build && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              <Badge className="bg-zinc-950 border-white/10 text-amber-500 text-[10px] uppercase tracking-tighter">
                {metadata.build}
              </Badge>
              <Badge className="bg-zinc-950 border-white/10 text-zinc-300 text-[10px] uppercase tracking-tighter">
                {metadata.type}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h4 className="text-xl font-medium mb-4 line-clamp-1 group-hover:text-amber-500 transition-colors">
            {formData.title || 'Your Listing Title'}
          </h4>
          
          {isAccount && metadata?.totalLevel && (
            <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Level {metadata.totalLevel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                {metadata.loginMethod}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Price</p>
              <p className="text-2xl font-light text-white">
                ${formData.price || '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Stock</p>
              <p className="text-lg text-zinc-300">
                {formData.stock || '0'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-amber-500/60" />
              <span>{formData.deliveryTime || 'Instant'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-amber-500/60" />
              <span>Verified Seller</span>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <p className="text-xs text-amber-500/80 leading-relaxed">
          <span className="font-bold uppercase tracking-tighter mr-1">Note:</span>
          This is how your listing will appear to potential buyers. Make sure your title and price are competitive.
        </p>
      </div>
    </div>
  );
}
