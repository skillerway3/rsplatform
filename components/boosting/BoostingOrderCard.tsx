'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, Info, CheckCircle2, Zap, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface BoostingOrderCardProps {
  options: {
    stream: boolean;
    offlineMode: boolean;
    remoteParsec: boolean;
    useVPN: boolean;
    jagexAccount: boolean;
  };
  onOptionChange: (key: string, value: boolean) => void;
  summary: {
    service: string;
    details: string[];
    game?: string;
    category?: string;
  };
  className?: string;
}

export function BoostingOrderCard({ options, onOptionChange, summary, className }: BoostingOrderCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOptions = [
    { key: 'stream', label: 'Live Stream', description: 'Watch your progress live' },
    { key: 'offlineMode', label: 'Offline Mode', description: 'Appear offline to friends' },
    { key: 'remoteParsec', label: 'Remote Parsec', description: 'Play via remote desktop' },
    { key: 'useVPN', label: 'VPN Protection', description: 'Safe IP matching' },
    { key: 'jagexAccount', label: 'Jagex Account', description: 'New account system support' },
  ];

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Submitting boosting request...', { summary, options });
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Default 24h

      const { data, error: supabaseError } = await supabase
        .from('buyer_requests')
        .insert({
          buyer_id: user.id,
          category: summary.category || 'boosting',
          game: summary.game || 'OSRS',
          title: `Request for ${summary.service}`,
          description: `Service: ${summary.service}\nDetails: ${summary.details.join(', ')}\nOptions: ${Object.entries(options).filter(([, v]) => v).map(([k]) => k).join(', ')}`,
          status: 'open',
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();

      if (supabaseError) {
        console.error('Supabase error submitting request:', supabaseError);
        throw new Error(supabaseError.message || 'Failed to submit request');
      }

      if (!data) {
        throw new Error('No data returned from request creation');
      }

      console.log('Request submitted successfully, redirecting to:', `/marketplace/requests/${data.id}`);
      
      try {
        await router.push(`/marketplace/requests/${data.id}`);
      } catch (redirectError) {
        console.error('Router redirect failed, falling back to window.location:', redirectError);
        window.location.href = `/marketplace/requests/${data.id}`;
      }
    } catch (err: unknown) {
      console.error('Error submitting request:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("sticky top-32 space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 group/sticky", className)}>
      {/* Subtle Glow Behind Card */}
      <div className="absolute -inset-4 bg-amber-500/5 blur-[60px] rounded-full opacity-0 group-hover/sticky:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <div className="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        {/* Animated Top Border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-black text-zinc-100 flex items-center gap-3 uppercase tracking-[0.4em]">
              Request Summary
            </h3>
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-0.5">Marketplace Request</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-5 mb-12">
          {toggleOptions.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between group/opt p-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-zinc-400 group-hover/opt:text-zinc-200 transition-colors uppercase tracking-widest">{opt.label}</span>
                <span className="text-[9px] text-zinc-600 font-medium tracking-tight">{opt.description}</span>
              </div>
              <button
                onClick={() => onOptionChange(opt.key, !options[opt.key as keyof typeof options])}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-all duration-500 p-1 border",
                  options[opt.key as keyof typeof options] 
                    ? "bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "bg-zinc-950 border-zinc-800"
                )}
              >
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded-full transition-all duration-500 transform shadow-sm",
                    options[opt.key as keyof typeof options] 
                      ? "translate-x-5 bg-amber-500 scale-110" 
                      : "translate-x-0 bg-zinc-700"
                  )}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Service Summary */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 to-transparent rounded-[2rem] -m-4 pointer-events-none border border-white/[0.03]" />
          <div className="relative p-4 space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
              <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">Selected Services</h4>
              <Zap className="w-3 h-3 text-zinc-800" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-black text-zinc-100 uppercase tracking-[0.15em] leading-none">{summary.service}</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Service Category</span>
                </div>
              </div>

              {summary.details.length > 0 ? (
                <div className="space-y-4 pl-10 border-l-2 border-zinc-800/50 ml-4">
                  {summary.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3 group/detail relative">
                      <div className="absolute -left-[11px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 border-2 border-zinc-900 group-hover/detail:bg-amber-500 transition-colors" />
                      <span className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-wide group-hover/detail:text-zinc-300 transition-colors">{detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pl-10 ml-4 py-6 border-l-2 border-dashed border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 font-medium italic uppercase tracking-widest">Awaiting selection...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          <Button 
            disabled={summary.details.length === 0 || isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "w-full h-16 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group/btn overflow-hidden relative",
              summary.details.length > 0 
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_20px_40px_rgba(245,158,11,0.2)]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
            <span className="relative z-10 flex items-center gap-3">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {summary.details.length > 0 ? 'Submit Request' : 'Select Options'}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800/50" />
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
              <Lock className="w-3 h-3" />
              Secure Escrow
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800/50" />
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-6 flex items-start gap-5 relative overflow-hidden group/shield shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover/shield:bg-emerald-500/10 transition-colors duration-700" />
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-lg group-hover/shield:scale-110 transition-transform duration-500">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-black text-emerald-500 mb-1.5 uppercase tracking-[0.3em] text-left">Buyer Protection</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed text-left font-medium tracking-tight">
            Your payment is held in secure escrow and only released upon successful service completion. 100% satisfaction guaranteed or full refund.
          </p>
        </div>
      </div>
    </div>
  );
}
