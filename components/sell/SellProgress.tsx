'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface SellProgressProps {
  currentStep: number;
  steps: string[];
}

export function SellProgress({ currentStep, steps }: SellProgressProps) {
  return (
    <div className="mb-12 relative">
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, index) => {
          const isCompleted = index + 1 < currentStep;
          const isActive = index + 1 === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? 'rgb(245, 158, 11)' : 'rgb(39, 39, 42)',
                  scale: isActive ? 1.1 : 1,
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isActive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-800'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-zinc-500'}`}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <span className={`mt-3 text-xs font-medium uppercase tracking-widest ${
                isActive ? 'text-amber-500' : 'text-zinc-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line */}
      <div className="absolute top-5 left-0 w-full h-[2px] bg-zinc-800 -z-0">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        />
      </div>
    </div>
  );
}
