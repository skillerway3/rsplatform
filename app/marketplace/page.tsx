'use client';

import * as React from 'react';
import { 
  ShoppingBag, 
  Search, 
  FileText, 
  PlusCircle, 
  ArrowRight,
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MarketplaceLandingPage() {
  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
            >
              The Ultimate Exchange
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none mb-6"
            >
              Marketplace
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto"
            >
              Browse premium assets, post custom requests, or start selling your own services on the most trusted platform.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Browse Offers */}
            <Link href="/browse">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="premium-card p-10 h-full flex flex-col group cursor-pointer border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Browse Offers</h2>
                  <p className="text-zinc-500 mb-8 flex-grow">
                    Explore thousands of premium listings from verified sellers. Find exactly what you need with advanced filters.
                  </p>
                  <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                    Explore Now <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>
              </motion.div>
            </Link>

            {/* Buyer Requests */}
            <Link href="/marketplace/requests">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="premium-card p-10 h-full flex flex-col group cursor-pointer border-white/5 hover:border-blue-500/30 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Buyer Requests</h2>
                  <p className="text-zinc-500 mb-8 flex-grow">
                    Can't find what you're looking for? Post a custom request and let sellers come to you with their best offers.
                  </p>
                  <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    View Requests <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>
              </motion.div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/sell">
              <Card className="premium-card p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-all group border-white/5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Start Selling</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Create a Listing</p>
                </div>
              </Card>
            </Link>

            <Link href="/marketplace/submit">
              <Card className="premium-card p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-all group border-white/5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Post Request</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Custom Needs</p>
                </div>
              </Card>
            </Link>

            <Link href="/trust">
              <Card className="premium-card p-8 flex flex-col items-center text-center gap-4 hover:bg-white/5 transition-all group border-white/5">
                <div className="w-12 h-12 rounded-xl bg-zinc-100/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-zinc-100" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Trust Center</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Safety First</p>
                </div>
              </Card>
            </Link>
          </div>

          {/* Features Bar */}
          <div className="mt-24 p-12 bg-zinc-900/50 rounded-[3rem] border border-white/5 flex flex-wrap justify-center gap-16">
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">
                <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Secure Escrow</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-500 mb-1">
                <Zap className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instant Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">
                <TrendingUp className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Verified Sellers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
