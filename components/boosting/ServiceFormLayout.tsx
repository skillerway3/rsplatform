'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, Zap, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { BoostingOrderCard } from './BoostingOrderCard';

interface ServiceFormLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
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
  };
  className?: string;
}

function TrustBenefit({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  const colorMap: Record<string, string> = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="group relative p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl transition-all duration-500 hover:border-zinc-700/50 hover:bg-zinc-900/60 overflow-hidden shadow-xl hover:shadow-2xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg", colorMap[color])}>
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-[14px] font-black text-zinc-100 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        {title}
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-zinc-600" />
      </h4>
      <p className="text-[13px] text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors duration-500">{description}</p>
    </div>
  );
}

export function ServiceFormLayout({ children, title, description, options, onOptionChange, summary, className }: ServiceFormLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-start", className)}>
      <div className="lg:col-span-8 space-y-16">
        <div className="relative p-12 rounded-[3rem] bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/[0.03] blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/[0.02] blur-[120px] rounded-full" />
          </div>
          
          <div className="relative space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Premium Service</span>
              </div>
              <h2 className="text-4xl font-black text-zinc-100 tracking-tight uppercase leading-none">{title}</h2>
              <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">{description}</p>
            </div>
            <div className="h-px bg-gradient-to-r from-zinc-800/50 via-zinc-800/50 to-transparent" />
            <div className="min-h-[400px]">
              {children}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TrustBenefit 
            icon={ShieldCheck} 
            title="RSPlatform Shield" 
            description="Advanced security with professional VPN masking and isolated hardware for every request."
            color="amber"
          />
          <TrustBenefit 
            icon={Zap} 
            title="Fast Response" 
            description="Our professional specialists start working on your request within 15-30 minutes of order confirmation."
            color="emerald"
          />
          <TrustBenefit 
            icon={Clock} 
            title="24/7 Support" 
            description="24/7 direct messaging with your assigned professional specialist."
            color="blue"
          />
          <TrustBenefit 
            icon={UserCheck} 
            title="Vetted Specialists" 
            description="Only the top 0.1% of global OSRS specialists are accepted into our professional boosting team."
            color="purple"
          />
        </div>
      </div>

      <div className="lg:col-span-4">
        <BoostingOrderCard 
          options={options}
          onOptionChange={onOptionChange}
          summary={summary}
        />
      </div>
    </div>
  );
}
