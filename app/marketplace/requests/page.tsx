'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ShieldCheck, Zap, Loader2, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
  game: string;
  category: string;
  buyer_id: string;
}

export default function MarketplaceRequestsPage() {
  const { loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('buyer_requests')
          .select('id, title, description, status, created_at, expires_at, game, category, buyer_id')
          .eq('status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err: unknown) {
        console.error('Error fetching requests:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Subscribe to new requests
    const subscription = supabase
      .channel('marketplace-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buyer_requests', filter: 'status=eq.open' }, (payload) => {
        setRequests(prev => [payload.new as Request, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">Marketplace Requests</h1>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-xl">
              Browse active requests from buyers and submit your best offers. Professional sellers only.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-xl px-6 text-[10px] font-black uppercase tracking-widest border-zinc-800 hover:bg-zinc-800 h-12">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-6 h-12 flex items-center gap-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Requests:</span>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{requests.length}</span>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem] p-24 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Zap className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">No Active Requests</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
              There are currently no open requests in the marketplace. Please check back later or refresh the page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request) => (
              <Link 
                key={request.id} 
                href={`/marketplace/requests/${request.id}`}
                className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 hover:border-amber-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                  <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                    {Math.max(0, Math.floor((new Date(request.expires_at).getTime() - Date.now()) / 3600000))}h Left
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                      <Zap className="w-3 h-3" /> {request.game}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors line-clamp-2">{request.title}</h3>
                  </div>

                  <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-3 h-12">
                    {request.description}
                  </p>

                  <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-zinc-600" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Buyer Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-500 group-hover:translate-x-1 transition-transform">
                      <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
