'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Camera, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SellerVerifyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'not_started' | 'pending' | 'approved' | 'rejected'>('not_started');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [documentType, setDocumentType] = useState('ID');
  const [files, setFiles] = useState<{
    idFront: File | null;
    idBack: File | null;
    selfie: File | null;
  }>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('seller_verifications')
          .select('status, rejection_reason')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching verification status:', fetchError);
        }

        if (data) {
          setStatus(data.status as 'not_started' | 'pending' | 'approved' | 'rejected');
          setRejectionReason(data.rejection_reason);
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!files.idFront || !files.idBack || !files.selfie) {
      setError('Please upload all required documents.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      console.log('Submitting seller verification for user:', user.id);
      // Upload files to Supabase Storage
      const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${path}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('verifications')
          .upload(fileName, file);
        
        if (error) {
          console.error(`Error uploading ${path}:`, error);
          throw error;
        }

        return data.path;
      };

      const [idFrontPath, idBackPath, selfiePath] = await Promise.all([
        uploadFile(files.idFront, 'id-front'),
        uploadFile(files.idBack, 'id-back'),
        uploadFile(files.selfie, 'selfie'),
      ]);

      // Create or update verification record
      const { error: insertError } = await supabase
        .from('seller_verifications')
        .upsert({
          user_id: user.id,
          phone_number: phoneNumber,
          document_type: documentType,
          id_front_url: idFrontPath,
          id_back_url: idBackPath,
          selfie_url: selfiePath,
          status: 'pending',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (insertError) {
        console.error('Error inserting verification record:', insertError);
        if (insertError.code === '42P01') {
          throw new Error('Database table "seller_verifications" not found. Please contact support.');
        }
        throw insertError;
      }

      // Send admin notification
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'seller_verification',
            userId: user.id,
            email: user.email
          })
        });
      } catch (notifyErr) {
        console.error('Failed to notify admin:', notifyErr);
      }

      console.log('Verification application submitted successfully');
      setStatus('pending');
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.replace('/sell/verify/pending');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification. Please try again later or contact support if the issue persists.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Verified Seller</h1>
        <p className="text-zinc-500 text-center max-w-md mb-12 uppercase tracking-widest text-[10px] font-bold leading-relaxed">
          Congratulations! Your identity has been verified. You can now list services and submit offers in the marketplace.
        </p>
        <Button variant="gold" onClick={() => router.push('/sell')}>Go to Seller Dashboard</Button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-500/20">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Verification Pending</h1>
        <p className="text-zinc-500 text-center max-w-md mb-12 uppercase tracking-widest text-[10px] font-bold leading-relaxed">
          Your application is currently being reviewed by our team. This process typically takes 24-48 hours. We will notify you once a decision is made.
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">Verification Rejected</h1>
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mb-12 max-w-md">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Reason for Rejection</p>
          <p className="text-zinc-400 text-xs font-bold leading-relaxed">
            {rejectionReason || 'Your application did not meet our requirements. Please try again with clearer documents.'}
          </p>
        </div>
        <Button variant="gold" onClick={() => setStatus('not_started')}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/sell" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Selling
          </Link>

          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">Seller Verification</h1>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              Complete your identity verification to unlock full seller features and build trust with buyers.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              Application submitted successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Phone Number */}
            <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Document Type */}
            <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Document Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {['ID', 'Driver\'s License', 'Passport'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocumentType(type)}
                      className={cn(
                        "h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        documentType === type 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                          : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ID Front */}
              <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                  <FileText className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Government ID (Front)</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Passport or Driver&apos;s License</p>
                </div>
                <label className="w-full">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'idFront')} />
                  <div className={cn(
                    "w-full h-12 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest",
                    files.idFront ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-amber-500/30 hover:text-amber-500"
                  )}>
                    {files.idFront ? <><CheckCircle2 className="w-4 h-4" /> Selected</> : <><Upload className="w-4 h-4" /> Upload Image</>}
                  </div>
                </label>
              </div>

              {/* ID Back */}
              <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                  <FileText className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Government ID (Back)</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Back side of your ID card</p>
                </div>
                <label className="w-full">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'idBack')} />
                  <div className={cn(
                    "w-full h-12 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest",
                    files.idBack ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-amber-500/30 hover:text-amber-500"
                  )}>
                    {files.idBack ? <><CheckCircle2 className="w-4 h-4" /> Selected</> : <><Upload className="w-4 h-4" /> Upload Image</>}
                  </div>
                </label>
              </div>

              {/* Selfie */}
              <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 md:col-span-2">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5">
                  <Camera className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Selfie with Note</h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest max-w-xs mx-auto">
                    Hold your ID and a handwritten note saying &quot;RSPLATFORM.GG&quot; with today&apos;s date.
                  </p>
                </div>
                <label className="w-full max-w-sm">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'selfie')} />
                  <div className={cn(
                    "w-full h-12 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest",
                    files.selfie ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-amber-500/30 hover:text-amber-500"
                  )}>
                    {files.selfie ? <><CheckCircle2 className="w-4 h-4" /> Selected</> : <><Upload className="w-4 h-4" /> Upload Selfie</>}
                  </div>
                </label>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={submitting}
              variant="gold" 
              className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10 group"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Submit Application
                  <CheckCircle2 className="w-4 h-4 ml-3 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 p-8 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Privacy Notice</p>
              <p className="text-[9px] text-zinc-600 leading-relaxed font-medium">
                Your personal documents are encrypted and stored securely. They are only used for identity verification purposes and are never shared with third parties or other users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
