'use client';

import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Shield,
  CreditCard,
  MessageSquare,
  Search,
  Eye,
  Scale,
  Gavel
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Platform Integrity</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]"
          >
            Trust & <span className="text-amber-500">Safety</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto"
          >
            RSPlatform is built on a foundation of security, transparency, and accountability. We empower our community with tools to trade safely.
          </motion.p>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Identity Verification",
              description: "All serious sellers undergo a rigorous identity verification process to ensure accountability and reduce fraud.",
              icon: UserCheck,
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            {
              title: "Secure Payments",
              description: "We partner with industry leaders like PayPal to ensure your financial data is encrypted and transactions are protected.",
              icon: CreditCard,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10"
            },
            {
              title: "Dispute Resolution",
              description: "Our dedicated support team is available 24/7 to mediate disputes and ensure fair outcomes for both buyers and sellers.",
              icon: Scale,
              color: "text-amber-500",
              bg: "bg-amber-500/10"
            }
          ].map((pillar, idx) => (
            <motion.div 
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-zinc-900 border border-white/5 rounded-3xl p-8 hover:border-amber-500/20 transition-all group"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", pillar.bg)}>
                <pillar.icon className={cn("w-6 h-6", pillar.color)} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 group-hover:text-amber-500 transition-colors">{pillar.title}</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Verification Tiers */}
      <section className="container mx-auto px-6 mb-32">
        <div className="bg-zinc-900 border border-white/5 rounded-[40px] p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          <div className="max-w-3xl space-y-8 relative z-10">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Seller Trust Tiers</h2>
            <p className="text-zinc-500 text-lg font-medium">We categorize sellers to help you make informed decisions about who you trade with.</p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-6 p-6 bg-zinc-950 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest mb-2">Verified Seller</h4>
                  <p className="text-zinc-500 text-sm font-medium">Seller has provided government-issued ID and passed our initial identity check. Look for the green badge.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 p-6 bg-zinc-950 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-widest mb-2">Trusted Seller</h4>
                  <p className="text-zinc-500 text-sm font-medium">Reserved for high-volume sellers with a long history of successful trades and excellent feedback. Look for the gold badge.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Trading Safety Tips</h2>
          <p className="text-zinc-500 font-medium">Follow these guidelines to ensure a smooth and secure experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Keep communication on-platform",
              description: "Never move conversations to external apps. Our support team can only mediate disputes if the chat history is on RSPlatform.",
              icon: MessageSquare
            },
            {
              title: "Verify order completion",
              description: "Only mark an order as 'Completed' once you have actually received the goods or services as described.",
              icon: CheckCircle
            },
            {
              title: "Check seller reviews",
              description: "Always review a seller's feedback history and trust badges before initiating a high-value transaction.",
              icon: Search
            },
            {
              title: "Report suspicious activity",
              description: "If a user asks for personal info or suggests an off-platform payment, report them immediately using the 'Report' button.",
              icon: ShieldAlert
            }
          ].map((tip) => (
            <div key={tip.title} className="flex items-center space-x-6 p-8 bg-zinc-900 border border-white/5 rounded-3xl">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 flex-shrink-0">
                <tip.icon className="w-6 h-6 text-zinc-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{tip.title}</h4>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
