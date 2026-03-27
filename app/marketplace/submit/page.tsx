'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Zap, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createNotification } from '@/lib/notifications';

export default function SubmitRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'OSRS',
    category: 'Boosting',
    budget_min: '',
    budget_max: '',
    expires_in_hours: '24'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expires_in_hours));

      const { data, error: submitError } = await supabase
        .from('buyer_requests')
        .insert({
          buyer_id: user.id,
          title: formData.title,
          description: formData.description,
          game: formData.game,
          category: formData.category,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          status: 'open',
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();

      if (submitError) {
        console.error('Submission error:', submitError);
        throw submitError;
      }

      if (!data) {
        throw new Error('No data returned from submission');
      }

      setSuccess(true);
      
      // Notify all verified sellers about the new request
      try {
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_verified_seller', true);

        if (sellers && sellers.length > 0) {
          const notificationPromises = sellers.map(seller => 
            createNotification({
              userId: seller.id,
              type: 'system',
              title: 'New Buyer Request',
              content: `A new request for ${formData.game} (${formData.category}) has been posted: "${formData.title}"`,
              link: `/marketplace/requests/${data.id}`
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notifyErr) {
        console.error('Error notifying sellers:', notifyErr);
        // Don't block the user if notifications fail
      }

      // Redirect immediately to avoid "freeze" feeling
      try {
        router.push(`/marketplace/requests/${data.id}`);
      } catch (routerErr) {
        console.error('Redirection error:', routerErr);
        // Fallback if router fails
        window.location.href = `/marketplace/requests/${data.id}`;
      }
    } catch (err: unknown) {
      console.error('Submit request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Access Denied</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Please log in to submit a request.</p>
          <Button variant="gold" onClick={() => router.push('/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8 md:mb-12">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shrink-0">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Submit Request</h1>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-xl text-center md:text-left">
              Describe what you need and professional sellers will submit their best offers.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-16 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Request Submitted!</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                Your request is now live. Redirecting you to manage it...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Request Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Need help with OSRS Inferno Cape"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe exactly what you need, any requirements, and your timeline..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[200px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Game</label>
                      <select 
                        value={formData.game}
                        onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                      >
                        <option value="OSRS">Old School RuneScape</option>
                        <option value="RS3">RuneScape 3</option>
                        <option value="WoW">World of Warcraft</option>
                        <option value="EVE">EVE Online</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                      >
                        <option value="Boosting">Boosting</option>
                        <option value="Gold">Gold</option>
                        <option value="Items">Items</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Coaching">Coaching</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Min Budget ($)</label>
                      <input 
                        type="number" 
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                        placeholder="Optional"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Max Budget ($)</label>
                      <input 
                        type="number" 
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                        placeholder="Optional"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-1">Request Expiry</label>
                    <select 
                      value={formData.expires_in_hours}
                      onChange={(e) => setFormData({ ...formData, expires_in_hours: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-16 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                    >
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours</option>
                      <option value="48">48 Hours</option>
                      <option value="72">3 Days</option>
                      <option value="168">7 Days</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  variant="gold" 
                  className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10 group/btn"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Secure Escrow Protection</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    Your payment is held in secure escrow and only released when you approve the delivery. Professional sellers only.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
