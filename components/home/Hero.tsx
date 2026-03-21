'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.5em]">The Premium Marketplace</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-zinc-100 tracking-tighter leading-[0.85] mb-10 uppercase">
              THE <span className="text-amber-500">PREMIUM</span> TRADING EXPERIENCE.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-12">
              Experience the most secure, high-liquidity marketplace for OSRS and RS3 digital assets. 
              Join 50,000+ verified traders in our marketplace.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/browse">
                <Button variant="gold" size="xl" className="rounded-2xl group w-full sm:w-auto">
                  Browse Inventory
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="secondary" size="xl" className="rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all w-full sm:w-auto">
                  Start Selling
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 pt-12 border-t border-white/5"
          >
            {[
              { label: 'Volume', value: '$2.4M+' },
              { label: 'Traders', value: '50K+' },
              { label: 'Delivery', value: '< 3m' },
              { label: 'Security', value: '100%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-black text-zinc-100 tracking-tighter mb-1">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
