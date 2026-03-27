'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function VerificationPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-amber-500/20 shadow-2xl shadow-amber-500/5">
        <Clock className="w-12 h-12 text-amber-500" />
      </div>
      
      <div className="space-y-4 mb-12 max-w-md">
        <div className="flex items-center justify-center gap-2 text-emerald-500 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Submitted Successfully</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white leading-none">Verification Pending</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
          Your application has been submitted successfully. This may take up to 4 hours to review. We will notify you once a decision is made.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button 
          variant="gold" 
          className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => router.push('/browse')}
        >
          Browse Marketplace
        </Button>
      </div>

      <Link 
        href="/support" 
        className="mt-12 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Need help? Contact Support
      </Link>
    </div>
  );
}
