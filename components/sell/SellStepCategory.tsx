'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { GAMES, CATEGORIES } from '@/data/mock';
import * as LucideIcons from 'lucide-react';

interface SellStepCategoryProps {
  formData: {
    gameId: string;
    categoryId: string;
  };
  updateFormData: (data: Partial<SellStepCategoryProps['formData']>) => void;
}

export function SellStepCategory({ formData, updateFormData }: SellStepCategoryProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">1</span>
          Select Game
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GAMES.map((game) => {
            const Icon = (LucideIcons as Record<string, React.ElementType>)[game.icon] || LucideIcons.Gamepad2;
            const isSelected = formData.gameId === game.id;
            
            return (
              <Card
                key={game.id}
                onClick={() => updateFormData({ gameId: game.id })}
                className={`p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${
                    isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {game.name}
                  </h3>
                </div>
                {isSelected && (
                  <motion.div 
                    layoutId="activeGame"
                    className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">2</span>
          Select Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => {
            const Icon = (LucideIcons as Record<string, React.ElementType>)[category.icon] || LucideIcons.Package;
            const isSelected = formData.categoryId === category.id;
            
            return (
              <Card
                key={category.id}
                onClick={() => updateFormData({ categoryId: category.id })}
                className={`p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl mb-3 transition-colors duration-300 ${
                    isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {category.name}
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
