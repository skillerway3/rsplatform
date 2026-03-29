'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Offer {
  id: string;
  request_id: string;
  price: number;
  delivery_time: string;
  message: string;
  status: string;
  created_at: string;
  request: {
    title: string;
    game: string;
    category: string;
    buyer: {
      username: string;
      avatar_url: string;
    };
  } | null;
}

export default function MyOffersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: offersData, error: offersError } = await supabase
        .from('buyer_request_offers')
        .select('id, request_id, price, delivery_time, message, status, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;
      if (!offersData || offersData.length === 0) {
        setOffers([]);
        return;
      }

      const requestIds = Array.from(new Set(offersData.map(o => o.request_id).filter(Boolean)));
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('buyer_requests')
        .select('id, title, game, category, buyer_id')
        .in('id', requestIds);

      if (requestsError) throw requestsError;

      const buyerIds = Array.from(new Set(requestsData?.map(r => r.buyer_id).filter(Boolean) || []));
      const { data: buyersData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', buyerIds);

      const enrichedOffers = offersData.map(offer => {
        const req = requestsData?.find(r => r.id === offer.request_id);
        const buyer = buyersData?.find(b => b.id === req?.buyer_id);
        
        return {
          ...offer,
          request: req ? {
            title: req.title,
            game: req.game,
            category: req.category,
            buyer: buyer || { username: 'Unknown', avatar_url: '' }
          } : null
        };
      });

      setOffers(enrichedOffers as Offer[]);
    } catch (err: unknown) {
      console.error('Error fetching offers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOffers();
  }, [user, authLoading, fetchOffers, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Offers Error</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button 
            onClick={() => fetchOffers()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glows - Simplified for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">My <span className="text-amber-500">Offers</span></h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Manage the offers you&apos;ve sent to buyers</p>
            </div>
          </div>

          {offers.length > 0 ? (
            <div className="space-y-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-amber-500/20 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        offer.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        offer.status === 'accepted' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-zinc-800 text-zinc-500 border-zinc-700"
                      )}>
                        {offer.status}
                      </div>
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        {offer.request?.game} • {offer.request?.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-amber-500 transition-colors">
                      {offer.request?.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/10">
                        <Image 
                          src={offer.request?.buyer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${offer.request?.buyer?.username}`}
                          alt={offer.request?.buyer?.username || 'User'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        For {offer.request?.buyer?.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                    <div className="text-center md:text-right">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-2xl font-black text-amber-500 tracking-tighter">{formatCurrency(offer.price)}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Delivery</p>
                      <p className="text-sm font-black text-white">{offer.delivery_time}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Sent On</p>
                      <p className="text-sm font-black text-white">{formatDate(offer.created_at)}</p>
                    </div>
                    <Link href={`/marketplace/requests/${offer.request_id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-[9px] font-black uppercase tracking-widest h-10 px-6">
                        View Request
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
              <Tag className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Offers Sent</h3>
              <p className="text-zinc-500 mb-10 max-w-md mx-auto">You haven&apos;t made any offers to buyer requests yet. Browse the marketplace to find opportunities.</p>
              <Link href="/marketplace" className="px-10 py-5 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
