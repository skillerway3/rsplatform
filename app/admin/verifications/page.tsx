'use client';

import React from 'react';
import { 
  Search, 
  CheckCircle,
  XCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Verification {
  id: string;
  user_id: string;
  document_type: string;
  id_front_url: string;
  id_back_url: string | null;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: { username: string; avatar_url: string | null; full_name: string | null } | null;
}

export default function AdminVerificationPage() {
  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  React.useEffect(() => {
    async function fetchVerifications() {
      try {
        let query = supabase.from('seller_verifications').select(`
          *,
          user:profiles!seller_verifications_user_id_fkey(username, avatar_url, full_name)
        `).order('created_at', { ascending: false });

        if (filter === 'pending') query = query.eq('status', 'pending');
        if (filter === 'approved') query = query.eq('status', 'approved');
        if (filter === 'rejected') query = query.eq('status', 'rejected');

        const { data, error } = await query;
        if (error) throw error;
        setVerifications((data as unknown as Verification[]) || []);
      } catch (error: unknown) {
        console.error('Error fetching verifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVerifications();
  }, [filter]);

  const handleUpdateStatus = async (id: string, userId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const { error: verifyError } = await supabase.from('seller_verifications').update({ 
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser?.id
      }).eq('id', id);

      if (verifyError) throw verifyError;

      if (status === 'approved') {
        await supabase.from('profiles').update({ is_verified_seller: true }).eq('id', userId);
      }

      // Refresh list
      setVerifications(prev => prev.filter(v => v.id !== id));
    } catch (error: unknown) {
      console.error('Error updating verification:', error);
    }
  };

  const filteredVerifications = verifications.filter(v => 
    v.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Seller Verification</h1>
          <p className="text-zinc-500 text-sm font-medium">Review identity documents and approve seller applications.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-zinc-900 border border-white/5 rounded-3xl">
            <p className="text-zinc-500 text-xs font-medium">No verification applications found.</p>
          </div>
        ) : (
          filteredVerifications.map((v) => (
            <div key={v.id} className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-amber-500/20 transition-all">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
                    <Image 
                      src={v.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.user_id}`}
                      alt={v.user?.username || 'User'}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">{v.user?.username || 'Unknown'}</p>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{v.user?.full_name || 'No Full Name'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-widest",
                    v.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    v.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  )}>
                    {v.status}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ID Type</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{v.document_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Submitted</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Documents</p>
                  <div className="grid grid-cols-3 gap-3">
                    {v.id_front_url && (
                      <a 
                        href={supabase.storage.from('verifications').getPublicUrl(v.id_front_url).data.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-950 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center hover:bg-white/5 transition-all"
                      >
                        <FileText className="w-5 h-5 text-zinc-500 mb-2" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Front</span>
                      </a>
                    )}
                    {v.id_back_url && (
                      <a 
                        href={supabase.storage.from('verifications').getPublicUrl(v.id_back_url).data.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-950 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center hover:bg-white/5 transition-all"
                      >
                        <FileText className="w-5 h-5 text-zinc-500 mb-2" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Back</span>
                      </a>
                    )}
                    {v.selfie_url && (
                      <a 
                        href={supabase.storage.from('verifications').getPublicUrl(v.selfie_url).data.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-950 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center hover:bg-white/5 transition-all"
                      >
                        <UserCheck className="w-5 h-5 text-amber-500 mb-2" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Selfie</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {v.status === 'pending' && (
                <div className="p-4 bg-zinc-950/50 border-t border-white/5 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-10 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest"
                    onClick={() => handleUpdateStatus(v.id, v.user_id, 'rejected')}
                  >
                    <XCircle className="w-3 h-3 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    variant="gold" 
                    className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest"
                    onClick={() => handleUpdateStatus(v.id, v.user_id, 'approved')}
                  >
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
