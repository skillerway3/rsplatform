'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function SellerVerifyPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [userId, setUserId] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [documentType, setDocumentType] = React.useState('passport');

  const [idFront, setIdFront] = React.useState<File | null>(null);
  const [idBack, setIdBack] = React.useState<File | null>(null);
  const [selfie, setSelfie] = React.useState<File | null>(null);

  React.useEffect(() => {
    const loadUser = async () => {
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

        setUserId(user.id);
        setUserEmail(user.email || null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const uploadFile = async (file: File, uid: string, label: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${uid}/${Date.now()}-${label}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('verifications')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;
    if (!userId) {
      setError('You must be logged in.');
      return;
    }

    if (!phoneNumber || !documentType || !idFront || !idBack || !selfie) {
      setError('Please fill all fields and upload all required files.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const [idFrontPath, idBackPath, selfiePath] = await Promise.all([
        uploadFile(idFront, userId, 'id-front'),
        uploadFile(idBack, userId, 'id-back'),
        uploadFile(selfie, userId, 'selfie'),
      ]);

      const { error: insertError } = await supabase.from('seller_verifications').upsert(
  {
    user_id: userId,
    phone_number: phoneNumber,
    document_type: documentType,
    id_front_url: idFrontPath,
    id_back_url: idBackPath,
    selfie_url: selfiePath,
    status: 'pending',
  },
  {
    onConflict: 'user_id',
  }
);

      if (insertError) throw insertError;

      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'seller_verification',
            userId,
            email: userEmail,
          }),
        });
      } catch (notifyError) {
        console.error('Admin notify failed:', notifyError);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Verification submit failed:', err);
      setError(err?.message || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Card className="border border-emerald-500/20 bg-emerald-500/10">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-black uppercase tracking-widest">
                Verification Submitted
              </h1>
              <p className="text-zinc-300">
                Your seller verification was submitted successfully and is now pending review.
              </p>
              <Button
                onClick={() => router.push('/sell')}
                className="bg-amber-500 text-black hover:bg-amber-400"
              >
                Back to Sell
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            Verify Identity
          </h1>
          <p className="text-zinc-500 text-sm">
            Upload your documents to become a verified seller.
          </p>
        </div>

        {error && (
          <Card className="border border-red-500/20 bg-red-500/10">
            <CardContent className="p-4 flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <Card className="border border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  ID Front
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  ID Back
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Selfie with Document
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 text-black hover:bg-amber-400 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Submit Verification
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}