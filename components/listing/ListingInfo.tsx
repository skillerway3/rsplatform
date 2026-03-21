import { Zap, Clock, Package, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';

interface ListingInfoProps {
  listing: Listing;
}

export function ListingInfo({ listing }: ListingInfoProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-100 tracking-tighter leading-[0.85] max-w-3xl uppercase">
            {listing.title}
          </h1>
          <div className="flex space-x-4 shrink-0">
            <Button variant="secondary" size="icon" className="rounded-[1.5rem] w-16 h-16 bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-all group shadow-xl">
              <Heart className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-[1.5rem] w-16 h-16 bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-all group shadow-xl">
              <Share2 className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-12 py-12 border-y border-zinc-900/50">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/5">
              <Zap className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Delivery</div>
              <div className="text-base text-zinc-100 font-black uppercase tracking-tight">{listing.deliveryMethod}</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/5">
              <Clock className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Speed</div>
              <div className="text-base text-zinc-100 font-black uppercase tracking-tight">{listing.deliveryTime}</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-black/20">
              <Package className="text-zinc-500 w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Stock</div>
              <div className="text-base text-zinc-100 font-black uppercase tracking-tight">{listing.stock} Units</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-8">
          <h2 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">Description</h2>
          <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-sm font-medium bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-900/50">
            {listing.description}
          </div>
        </div>
      </div>
    </div>
  );
}
