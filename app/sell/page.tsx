import React from 'react';
import { SellHeader } from '@/components/sell/SellHeader';
import { SellForm } from '@/components/sell/SellForm';

export default function SellPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SellHeader />
        <SellForm />
      </div>
    </div>
  );
}
