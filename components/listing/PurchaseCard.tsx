import { ShieldCheck, Zap, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PurchaseCardProps {
  listing: Listing;
}

export function PurchaseCard({ listing }: PurchaseCardProps) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-2xl shadow-[0_64px_128px_-32px_rgba(0,0,0,0.6)] rounded-[3.5rem] overflow-hidden">
      <CardContent className="p-12">
        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em] mb-6">Investment</div>
        <div className="text-7xl font-black text-zinc-100 tracking-tighter mb-12 flex items-baseline">
          <span className="text-3xl text-amber-500 mr-2 font-black tracking-tighter">$</span>
          {listing.price.toFixed(2)}
        </div>

        <div className="space-y-6 mb-12">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-zinc-600">Service Fee</span>
            <span className="text-emerald-500">Waived</span>
          </div>
          <div className="flex justify-between text-sm font-black border-t border-zinc-800/50 pt-8">
            <span className="text-zinc-500 uppercase tracking-widest">Total Amount</span>
            <span className="text-zinc-100 text-2xl tracking-tighter">{formatCurrency(listing.price)}</span>
          </div>
        </div>

        <div className="space-y-6">
          <Button variant="gold" size="lg" className="w-full h-20 text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all">
            Secure Purchase
          </Button>
          <Button variant="secondary" size="lg" className="w-full h-20 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-zinc-800/50 border-zinc-800 hover:bg-zinc-800 transition-all">
            Add to Collection
          </Button>
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-800/50 flex items-center justify-around">
          <div className="flex flex-col items-center space-y-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Verified</span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Instant</span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Premium</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
