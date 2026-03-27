'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative py-32 flex items-center overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">

      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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

          {/* Hero Visuals */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-[2rem] overflow-hidden border border-white/5 group">
                  <Image 
                    src="/osrs-hero-v2.jpg" 
                    alt="OSRS Trading" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
                <div className="relative h-48 rounded-[2rem] overflow-hidden border border-white/5 group">
                  <Image 
                    src="/rs3-hero-v2.jpg" 
                    alt="RS3 Trading" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
              </div>
              <div className="pt-12">
                <div className="relative h-[28rem] rounded-[2rem] overflow-hidden border border-white/5 group">
                  <Image 
                    src="/rsps-hero-v2.jpg" 
                    alt="RSPS Trading" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Marketplace</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Listings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-zinc-950" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Verified Security</p>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">Escrow Protected</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
