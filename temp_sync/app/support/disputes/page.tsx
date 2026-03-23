'use client';

import React from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DisputesPage() {
  const steps = [
    {
      icon: FileText,
      title: 'Submit Evidence',
      description: 'Provide clear screenshots of the transaction, chat logs, and any other relevant proof of the issue.'
    },
    {
      icon: Scale,
      title: 'Review Process',
      description: 'Our specialized dispute resolution team will review all evidence from both parties within 24-48 hours.'
    },
    {
      icon: CheckCircle2,
      title: 'Final Decision',
      description: 'Once a decision is reached, funds will be released to the rightful party or a refund will be issued.'
    }
  ];

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Dispute Resolution</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none mb-8">
              Fair <span className="text-amber-500">Resolution</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Our dispute resolution process is designed to be fair, transparent, and efficient. We ensure that every trader is protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {steps.map((step, i) => (
              <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-500" />
                <div className="w-14 h-14 bg-zinc-950/50 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/50 transition-all duration-500">
                  <step.icon className="w-7 h-7 text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Open a Dispute</h2>
              </div>
              <p className="text-zinc-500 text-base font-medium leading-relaxed">
                If you have encountered an issue with an order, please contact our support team immediately. Make sure to have your order ID ready.
              </p>
              <div className="pt-4">
                <Button variant="gold" className="px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/10">
                  Open Support Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
