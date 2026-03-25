'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Tag, 
  Edit3, 
  Trash2, 
  Eye, 
  PauseCircle, 
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  game: string;
  category: string;
  images: string[];
}

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'sold'>('all');

  const fetchListings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message);
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
    fetchListings();
  }, [user, authLoading, fetchListings, router]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing');
    }
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         l.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">My <span className="text-amber-500">Listings</span></h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Manage your active marketplace items</p>
            </div>
            <Link href="/sell">
              <Button variant="gold" className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20">
                <PlusCircle className="w-5 h-5 mr-3" />
                Create New Listing
              </Button>
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search your listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-14 pr-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            <div className="flex bg-zinc-900/50 border border-white/5 rounded-2xl p-1.5">
              {(['all', 'active', 'paused', 'sold'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    statusFilter === status ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" : "text-zinc-500 hover:text-white"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-amber-500/20 transition-all">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 shrink-0">
                      {listing.images?.[0] ? (
                        <Image 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-8 h-8 text-zinc-800" />
                        </div>
                      )}
                      <div className={cn(
                        "absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest z-10",
                        listing.status === 'active' ? "bg-emerald-500 text-white" :
                        listing.status === 'paused' ? "bg-amber-500 text-zinc-950" :
                        "bg-zinc-700 text-white"
                      )}>
                        {listing.status}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{listing.game}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{listing.category}</span>
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight truncate group-hover:text-amber-500 transition-colors mb-1">{listing.title}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Listed on {formatDate(listing.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                    <div className="text-center md:text-right">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(listing.price)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/listing/${listing.id}`}>
                        <button className="w-11 h-11 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all" title="View Listing">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                      <Link href={`/sell/edit/${listing.id}`}>
                        <button className="w-11 h-11 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:bg-amber-500/5 transition-all" title="Edit Listing">
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </Link>
                      {listing.status === 'active' ? (
                        <button 
                          onClick={() => handleUpdateStatus(listing.id, 'paused')}
                          className="w-11 h-11 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:bg-amber-500/5 transition-all" 
                          title="Pause Listing"
                        >
                          <PauseCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus(listing.id, 'active')}
                          className="w-11 h-11 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all" 
                          title="Activate Listing"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteListing(listing.id)}
                        className="w-11 h-11 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all" 
                        title="Delete Listing"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
              <Tag className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Listings Found</h3>
              <p className="text-zinc-500 mb-10 max-w-md mx-auto">You don&apos;t have any listings matching your current filters. Start selling your items today!</p>
              <Link href="/sell">
                <Button variant="gold" className="px-10 py-5 h-auto rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20">
                  Create New Listing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
