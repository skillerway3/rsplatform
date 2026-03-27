'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion } from 'motion/react';
import { 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Zap,
  Loader2,
  Trash2,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Offer {
  id: string;
  buyer_request_id: string;
  seller_id: string;
  price: number;
  delivery_time: string;
  message: string;
  status: string;
  created_at: string;
  seller: {
    id: string;
    username: string;
    avatar_url: string;
    average_rating: number;
    review_count: number;
    is_trusted_seller: boolean;
  };
}

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  game: string;
  status: string;
  created_at: string;
  expires_at: string;
  offers: Offer[];
}

export default function BuyerRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestToClose, setRequestToClose] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: requestsData, error: requestsError } = await supabase
        .from('buyer_requests')
        .select('id, title, description, category, game, status, created_at, expires_at')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }

      const requestIds = requestsData.map(r => r.id);

      const { data: offersData, error: offersError } = await supabase
        .from('buyer_request_offers')
        .select('id, buyer_request_id, seller_id, price, delivery_time, message, status, created_at')
        .in('buyer_request_id', requestIds);

      if (offersError) throw offersError;

      const sellerIds = Array.from(new Set(offersData?.map(o => o.seller_id).filter(Boolean) || []));
      let sellers: Offer['seller'][] = [];
      if (sellerIds.length > 0) {
        const { data: sellersData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, average_rating, review_count, is_trusted_seller')
          .in('id', sellerIds);
        
        if (sellersData) {
          sellers = sellersData.map(s => ({
            id: s.id,
            username: s.username,
            avatar_url: s.avatar_url || '',
            average_rating: s.average_rating || 0,
            review_count: s.review_count || 0,
            is_trusted_seller: s.is_trusted_seller || false
          }));
        }
      }

      const enrichedRequests = requestsData.map(req => {
        const reqOffers = (offersData || [])
          .filter(o => o.buyer_request_id === req.id)
          .map(offer => {
            const seller = sellers.find((s) => s.id === offer.seller_id);
            return {
              ...offer,
              seller: seller || { 
                id: offer.seller_id,
                username: 'Unknown', 
                avatar_url: '',
                average_rating: 0,
                review_count: 0,
                is_trusted_seller: false
              }
            };
          })
          .sort((a, b) => {
            if (a.seller.is_trusted_seller && !b.seller.is_trusted_seller) return -1;
            if (!a.seller.is_trusted_seller && b.seller.is_trusted_seller) return 1;
            return a.price - b.price;
          });

        return {
          ...req,
          offers: reqOffers
        };
      });

      setRequests(enrichedRequests as BuyerRequest[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
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
    fetchRequests();
  }, [user, authLoading, fetchRequests, router]);

  const handleCloseRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('buyer_requests')
        .update({ status: 'closed' })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
    } catch (err: unknown) {
      console.error('Error closing request:', err);
      setError(err instanceof Error ? err.message : 'Failed to close request');
    }
  };

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
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Requests Error</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button 
            onClick={() => fetchRequests()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glows - Simplified for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">My <span className="text-amber-500">Requests</span></h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Manage your marketplace requests and review offers</p>
          </div>
          <Link href="/marketplace/submit" className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            New Request
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-zinc-900/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-8">
            {requests.map((req) => (
              <div key={req.id} className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden">
                {/* Request Header */}
                  <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    <div className="flex-1 pr-12 md:pr-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          req.status === 'open' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                        )}>
                          {req.status}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{req.category} • {req.game}</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-2">{req.title}</h2>
                      <p className="text-sm text-zinc-400 line-clamp-2 md:line-clamp-1">{req.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-left md:text-right">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Created On</p>
                        <p className="text-xs font-black text-white">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      {req.status === 'open' && (
                        <button 
                          onClick={() => setRequestToClose(req.id)}
                          className="absolute top-6 right-6 md:static p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Offers Section */}
                <div className="p-6 md:p-10 bg-zinc-950/30">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                      Offers Received ({req.offers.length})
                    </h3>
                  </div>

                  {req.offers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {req.offers.map((offer) => (
                        <div key={offer.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-amber-500/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                              <Image
                                src={offer.seller.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${offer.seller.username}`}
                                alt={offer.seller.username || 'Seller'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-sm font-black uppercase tracking-widest text-white truncate">{offer.seller.username}</h4>
                                {offer.seller.is_trusted_seller && (
                                  <div className="flex items-center px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[7px] font-black text-amber-500 uppercase tracking-widest">
                                    <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                                    Trusted
                                  </div>
                                )}
                                <div className="flex items-center text-[10px] text-amber-500">
                                  <Zap className="w-3 h-3 mr-1 fill-amber-500" />
                                  <span>{offer.seller.average_rating} ({offer.seller.review_count})</span>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-500 line-clamp-1 italic">&quot;{offer.message}&quot;</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row md:flex-wrap items-center justify-between md:justify-end gap-4 md:gap-6 border-t border-white/5 pt-4 md:border-0 md:pt-0 w-full md:w-auto">
                            <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                              <div className="text-left md:text-right">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Delivery</p>
                                <p className="text-xs font-black text-white">{offer.delivery_time}</p>
                              </div>
                              <div className="text-left md:text-right">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Price</p>
                                <p className="text-lg font-black text-amber-500">${offer.price}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              {req.status === 'open' ? (
                                <>
                                  <Link 
                                    href={`/orders/${req.id}`}
                                    className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center"
                                  >
                                    View & Pay
                                  </Link>
                                  <Link 
                                    href={`/messages?seller=${offer.seller_id}&request=${req.id}`}
                                    className="p-3 bg-white/5 text-zinc-400 border border-white/10 rounded-xl hover:text-white hover:bg-white/10 transition-all"
                                  >
                                    <MessageSquare className="w-5 h-5" />
                                  </Link>
                                </>
                              ) : offer.status === 'accepted' ? (
                                <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px] w-full justify-center md:justify-end">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accepted
                                </div>
                              ) : (
                                <div className="text-zinc-600 font-black uppercase tracking-widest text-[10px] w-full text-center md:text-right">
                                  {offer.status}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-zinc-950/20 rounded-2xl border border-dashed border-white/5">
                      <Clock className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                      <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Waiting for offers...</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
            <Zap className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Requests Yet</h3>
            <p className="text-zinc-500 mb-10 max-w-md mx-auto">You haven&apos;t posted any requests in the marketplace. Start by creating your first request to get offers from verified sellers.</p>
            <Link href="/marketplace/submit" className="px-10 py-5 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
              Create First Request
            </Link>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!requestToClose}
        onClose={() => setRequestToClose(null)}
        onConfirm={() => requestToClose && handleCloseRequest(requestToClose)}
        title="Close Request"
        message="Are you sure you want to close this request? This action cannot be undone and you will no longer receive offers."
        confirmText="Close Request"
        variant="danger"
      />

      {error && (
        <div className="fixed bottom-8 right-8 z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-black uppercase tracking-widest">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
