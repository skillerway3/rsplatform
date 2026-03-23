'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  Loader2,
  User,
  Phone,
  FileText,
  AlertCircle,
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
  profiles?: {
    username?: string | null;
    avatar_url?: string | null;
    is_admin?: boolean | null;
    is_verified_seller?: boolean | null;
  } | null;
}

export default function AdminVerificationsPage() {
  const router = useRouter();

  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rejectionId, setRejectionId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  const fetchVerifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('seller_verifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const rows = (data || []) as Verification[];

      const userIds = [...new Set(rows.map((v) => v.user_id).filter(Boolean))];

      let profilesMap = new Map<string, any>();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, is_admin, is_verified_seller')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
      }

      const verificationsWithSignedUrls = await Promise.all(
        rows.map(async (v) => {
          const [front, back, selfie] = await Promise.all([
            supabase.storage.from('verifications').createSignedUrl(v.id_front_url, 3600),
            supabase.storage.from('verifications').createSignedUrl(v.id_back_url, 3600),
            supabase.storage.from('verifications').createSignedUrl(v.selfie_url, 3600),
          ]);

          return {
            ...v,
            profiles: profilesMap.get(v.user_id) || null,
            id_front_signed_url: front.data?.signedUrl || '',
            id_back_signed_url: back.data?.signedUrl || '',
            selfie_signed_url: selfie.data?.signedUrl || '',
          };
        })
      );

      setVerifications(verificationsWithSignedUrls);
    } catch (err: any) {
      console.error('Failed to fetch verifications:', err);
      setError(err?.message || 'Failed to load verifications');
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdmin = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.is_admin) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await fetchVerifications();
    } catch (err: any) {
      console.error('Admin check failed:', err);
      setError(err?.message || 'Failed to verify admin access');
      setLoading(false);
    }
  }, [router, fetchVerifications]);

  React.useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const handleAction = async (
    verification: Verification,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    setProcessingId(verification.id);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('You must be logged in.');

      const { error: verificationError } = await supabase
        .from('seller_verifications')
        .update({
          status,
          rejection_reason: reason || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', verification.id);

      if (verificationError) throw verificationError;

      if (status === 'approved') {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ is_verified_seller: true })
          .eq('id', verification.user_id);

        if (profileUpdateError) throw profileUpdateError;
      }

      setVerifications((prev) => prev.filter((v) => v.id !== verification.id));
      setRejectionId(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error('Failed to process verification:', err);
      setError(err?.message || 'Failed to process verification');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin && loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

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
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Review pending seller applications
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push('/sell')}
            className="text-zinc-500 hover:text-zinc-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Sell
          </Button>
        </div>

        {error && (
          <Card className="border border-red-500/20 bg-red-500/10">
            <CardContent className="p-4 flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

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
                <p className="text-zinc-500 text-xs font-medium">
                  No pending verifications to review.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {verifications.map((v) => (
              <Card key={v.id} className="premium-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                      {v.profiles?.avatar_url ? (
                        <Image
                          src={v.profiles.avatar_url}
                          alt={v.profiles?.username || 'User'}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm">
                        {v.profiles?.username || 'Unknown User'}
                      </h3>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        User ID: {v.user_id.slice(0, 8)}...
                      </p>
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
                        <div className="flex items-center justify-between text-[11px] gap-4">
                          <span className="text-zinc-500 font-black uppercase tracking-widest flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            Phone
                          </span>
                          <span className="font-medium text-right">{v.phone_number}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] gap-4">
                          <span className="text-zinc-500 font-black uppercase tracking-widest flex items-center">
                            <FileText className="w-3 h-3 mr-2" />
                            Document
                          </span>
                          <span className="font-medium uppercase text-right">{v.document_type}</span>
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
                              onClick={() => handleAction(v, 'rejected', rejectionReason)}
                              disabled={!rejectionReason || processingId === v.id}
                            >
                              Confirm Reject
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex-1 h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                              onClick={() => {
                                setRejectionId(null);
                                setRejectionReason('');
                              }}
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
                            onClick={() => handleAction(v, 'approved')}
                          >
                            {processingId === v.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Approve Seller'
                            )}
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
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        ID Front
                      </p>
                      <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        {v.id_front_signed_url ? (
                          <>
                            <Image
                              src={v.id_front_signed_url}
                              alt="ID Front"
                              fill
                              className="object-contain"
                            />
                            <a
                              href={v.id_front_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ExternalLink className="w-6 h-6 text-white" />
                            </a>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                            Failed to load image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        ID Back
                      </p>
                      <div className="aspect-[4/3] relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        {v.id_back_signed_url ? (
                          <>
                            <Image
                              src={v.id_back_signed_url}
                              alt="ID Back"
                              fill
                              className="object-contain"
                            />
                            <a
                              href={v.id_back_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ExternalLink className="w-6 h-6 text-white" />
                            </a>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                            Failed to load image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        Selfie Verification
                      </p>
                      <div className="aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-black group">
                        {v.selfie_signed_url ? (
                          <>
                            <Image
                              src={v.selfie_signed_url}
                              alt="Selfie"
                              fill
                              className="object-contain"
                            />
                            <a
                              href={v.selfie_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ExternalLink className="w-6 h-6 text-white" />
                            </a>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                            Failed to load image
                          </div>
                        )}
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