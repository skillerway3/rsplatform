'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DollarSign, Clock, Package, Truck } from 'lucide-react';

interface SellStepPricingProps {
  formData: {
    price: string;
    stock: string;
    deliveryTime: string;
    deliveryMethod: string;
  };
  updateFormData: (data: Partial<SellStepPricingProps['formData']>) => void;
}

export function SellStepPricing({ formData, updateFormData }: SellStepPricingProps) {
  const deliveryTimes = ['Instant', '15 mins', '1 hour', '24 hours'];
  const deliveryMethods = ['Face-to-Face', 'In-game Mail', 'Account Transfer'];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">5</span>
          Pricing & Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Price (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => updateFormData({ price: e.target.value })}
                className="pl-12 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 h-14 text-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Stock Quantity</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="number"
                placeholder="1"
                value={formData.stock}
                onChange={(e) => updateFormData({ stock: e.target.value })}
                className="pl-12 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 h-14 text-lg"
              />
            </div>
          </div>
        </div>

        {formData.price && parseFloat(formData.price) > 0 && (
          <div className="mt-6 p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estimated Payout</p>
              <p className="text-xs text-zinc-400 font-medium">After 5% platform fee</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-500 tracking-tighter">
                ${(parseFloat(formData.price) * 0.95).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">6</span>
          Delivery Options
        </h2>
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Delivery Time
            </label>
            <div className="flex flex-wrap gap-3">
              {deliveryTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => updateFormData({ deliveryTime: time })}
                  className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                    formData.deliveryTime === time
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-4 h-4" /> Delivery Method
            </label>
            <div className="flex flex-wrap gap-3">
              {deliveryMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => updateFormData({ deliveryMethod: method })}
                  className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                    formData.deliveryMethod === method
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
