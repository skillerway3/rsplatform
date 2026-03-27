'use client';

import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function SafetyPage() {
  const safetyTips = [
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'All payments are held in escrow until you confirm receipt of your digital assets. Never release payment before you have received what you paid for.'
    },
    {
      icon: Eye,
      title: 'Privacy Protection',
      description: 'We never share your personal information with third parties. All communication should happen through our secure messaging system.'
    },
    {
      icon: AlertTriangle,
      title: 'Avoid Scams',
      description: 'Be wary of deals that seem too good to be true. Always check a seller\'s rating and total sales before making a purchase.'
    },
    {
      icon: CheckCircle2,
      title: 'Verified Sellers',
      description: 'Look for the verified badge on seller profiles. These traders have undergone additional identity verification for your safety.'
    }
  ];

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Guide</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none mb-8">
              Trading <span className="text-amber-500">Safely</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Your security is our top priority. Follow these guidelines to ensure a safe and smooth trading experience on RSPLATFORM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {safetyTips.map((tip, i) => (
              <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-500" />
                <div className="w-14 h-14 bg-zinc-950/50 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/50 transition-all duration-500">
                  <tip.icon className="w-7 h-7 text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{tip.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-12 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6 text-zinc-950" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Important Notice</h2>
            </div>
            <p className="text-zinc-400 text-base font-medium leading-relaxed">
              RSPLATFORM will never ask for your account password or email credentials. If someone claiming to be staff asks for this information, report them immediately. Always ensure you are on the official rsplatform.com domain before entering any sensitive information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
