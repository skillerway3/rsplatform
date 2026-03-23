'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative py-32 flex items-center overflow-hidden">
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
            <h1 className="text-6xl md:text-8xl font-black text-zinc-100 tracking-tighter leading-[0.85] mb-10 uppercase">
              THE <span className="text-amber-500">PREMIUM</span> TRADING EXPERIENCE.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-12">
              Experience the most secure, high-liquidity marketplace for OSRS and RS3 digital assets. 
              Join verified traders in our marketplace.
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
        </div>
      </div>
    </section>
  );
}
