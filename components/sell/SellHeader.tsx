'use client';

import React from 'react';
import { motion } from 'motion/react';

export function SellHeader() {
  return (
    <div className="mb-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-light tracking-tight mb-4"
      >
        List Your <span className="italic serif text-amber-500/80">Asset</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-zinc-400 max-w-2xl text-lg"
      >
        Reach thousands of potential buyers in our premium marketplace. 
        Follow our simple steps to create a high-converting listing.
      </motion.p>
    </div>
  );
}
