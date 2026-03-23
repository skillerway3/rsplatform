'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronLeft,
  Loader2,
  User,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Verification {
  id: string;
  user_id: string;
  phone_number: string;
  document_type: string;
  id_front_url: string;
  id_back_url: string;
  selfie_url: string;
  id_front_signed_url?: string;
  id_back_signed_url?: string;
  selfie_signed_url?: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchVerifications = React.useCallback(async (status: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_verifications')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: status === 'pending' });

    if (!error && data) {
      const verificationsWithSignedUrls = await Promise.all((data as any[]).map(async (v) => {
        const [front, back, selfie] = await Promise.all([
          supabase.storage.from('verifications').createSignedUrl(v.id_front_url, 3600),
          supabase.storage.from('verifications').createSignedUrl(v.id_back_url, 3600),
          supabase.storage.from('verifications').createSignedUrl(v.selfie_url, 3600)
        ]);

        return {
          ...v,
          id_front_signed_url: front.data?.signedUrl,
          id_back_signed_url: back.data?.signedUrl,
          selfie_signed_url: selfie.data?.signedUrl
        };
      }));
      setVerifications(verificationsWithSignedUrls);
    }
    setLoading(false);
  }, []);

  const checkAdmin = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email === 'skillerway100@gmail.com') {
      setIsAdmin(true);
      fetchVerifications(activeTab);
    } else {
      router.push('/');
    }
  }, [router, fetchVerifications, activeTab]);

  React.useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const [rejectionId, setRejectionId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const handleAction = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationId: id, 
          status, 
          rejectionReason: reason 
        })
      });

      if (!response.ok) throw new Error('Failed to update verification status');

      fetchVerifications(activeTab);
      setRejectionId(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error('Error handling verification action:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center">
              <ShieldCheck className="w-8 h-8 mr-3 text-amber-500" />
              Seller Verifications
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Review seller applications</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? "bg-amber-500 text-black" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => router.push('/sell')} className="text-zinc-500 hover:text-zinc-100">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Sell
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : verifications.length === 0 ? (
          <Card className="premium-card p-20 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                <CheckCircle2 className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-widest">All Caught Up</h3>
                <p className="text-zinc-500 text-xs font-medium">No pending verifications to review.</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {verifications.map((v) => (
              <Card key={v.id} className="premium-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800">
                      <Image 
                        src={v.profiles.avatar_url} 
                        alt={v.profiles.username} 
                        width={48} 
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm">{v.profiles.username}</h3>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">User ID: {v.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>Submitted {new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center">
                        <User className="w-3 h-3 mr-2" />
                        Contact Info
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-black uppercase tracking-widest flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            Phone
                          </span>
                          <span className="font-medium">{v.phone_number}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500 font-black uppercase tracking-widest flex items-center">
                            <FileText className="w-3 h-3 mr-2" />
                            Document
                          </span>
                          <span className="font-medium uppercase">{v.document_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 pt-4 border-t border-white/5">
                      {rejectionId === v.id ? (
                        <div className="space-y-3">
                          <textarea
                            placeholder="Enter rejection reason..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500/50"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              className="flex-1 h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                              onClick={() => handleAction(v.id, 'rejected', rejectionReason)}
                              disabled={!rejectionReason || processingId === v.id}
                            >
                              Confirm Reject
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex-1 h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                              onClick={() => setRejectionId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="gold" 
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
                            disabled={processingId === v.id}
                            onClick={() => handleAction(v.id, 'approved')}
                          >
                            {processingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Seller'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full h-12 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px]"
                            disabled={processingId === v.id}
                            onClick={() => setRejectionId(v.id)}
                          >
                            Reject Application
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">ID Front</p>
                      <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        <Image 
                          src={v.id_front_signed_url || v.id_front_url} 
                          alt="ID Front" 
                          fill 
                          className="object-contain"
                        />
                        <a 
                          href={v.id_front_signed_url || v.id_front_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <ExternalLink className="w-6 h-6 text-white" />
                        </a>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">ID Back</p>
                      <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        <Image 
                          src={v.id_back_signed_url || v.id_back_url} 
                          alt="ID Back" 
                          fill 
                          className="object-contain"
                        />
                        <a 
                          href={v.id_back_signed_url || v.id_back_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <ExternalLink className="w-6 h-6 text-white" />
                        </a>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Selfie Verification</p>
                      <div className="aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        <Image 
                          src={v.selfie_signed_url || v.selfie_url} 
                          alt="Selfie" 
                          fill 
                          className="object-contain"
                        />
                        <a 
                          href={v.selfie_signed_url || v.selfie_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <ExternalLink className="w-6 h-6 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
