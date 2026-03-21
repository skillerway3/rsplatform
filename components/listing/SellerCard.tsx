import { ShieldCheck, Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';

interface SellerCardProps {
  seller: User;
}

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <Card className="border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group shadow-2xl">
      <CardContent className="p-10">
        <div className="flex items-center space-x-6 mb-10">
          <div className="relative">
            <div className="w-20 h-20 relative rounded-3xl overflow-hidden bg-zinc-800 shadow-2xl">
              <Image 
                src={seller.avatar} 
                alt={seller.username} 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-zinc-900 flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-zinc-100 font-black text-xl tracking-tighter uppercase">{seller.username}</h3>
            </div>
            <div className="flex items-center text-amber-500 text-[10px] font-black tracking-widest uppercase mt-2">
              <Star className="w-3 h-3 fill-current mr-2" />
              {seller.rating} <span className="text-zinc-600 font-black ml-3">({seller.totalSales} Sales)</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-black/40 p-6 rounded-3xl border border-zinc-800/50">
            <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2">Response</div>
            <div className="text-xs text-zinc-100 font-black tracking-tight">~15 MINS</div>
          </div>
          <div className="bg-black/40 p-6 rounded-3xl border border-zinc-800/50">
            <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2">Legacy</div>
            <div className="text-xs text-zinc-100 font-black tracking-tight">EST. 2023</div>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="w-full h-16 rounded-2xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-[10px] uppercase font-black tracking-widest">
          <MessageSquare className="w-4 h-4 mr-3" />
          Secure Message
        </Button>
      </CardContent>
    </Card>
  );
}
