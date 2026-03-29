'use client';

import React from 'react';
import { ShieldCheck, Zap, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Listing } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import type { OnApproveData } from '@paypal/paypal-js';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface PurchaseCardProps {
  listing: Listing;
}

export function PurchaseCard({ listing }: PurchaseCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const total = Number(listing.price || 0);

  const handleCreateOrder = async (): Promise<string> => {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId: listing.id,
      }),
    });

    const result: { orderId?: string; id?: string; error?: string } =
      await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create PayPal order');
    }

    const orderId = result.orderId || result.id;

    if (!orderId) {
      throw new Error('Missing PayPal order ID');
    }

    return orderId;
  };

  const handleApprove = async (data: OnApproveData): Promise<void> => {
    try {
      setIsProcessing(true);

      if (!data.orderID) {
        throw new Error('Missing PayPal order ID');
      }

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          paypalOrderId: data.orderID,
        }),
      });

      const result: { order?: { id: string }; error?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process order');
      }

      if (!result.order?.id) {
        throw new Error('Missing created order ID');
      }

      router.push(`/orders/${result.order.id}`);
    } catch (err: unknown) {
      console.error('Payment/Order creation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-zinc-800/50 bg-zinc-900 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.6)] rounded-[3.5rem] overflow-hidden">
      <CardContent className="p-12">
        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em] mb-6">
          Investment
        </div>

        <div className="text-7xl font-black text-zinc-100 tracking-tighter mb-12 flex items-baseline">
          <span className="text-3xl text-amber-500 mr-2 font-black tracking-tighter">
            $
          </span>
          {total.toFixed(2)}
        </div>

        <div className="space-y-6 mb-12">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-zinc-600">Service Fee</span>
            <span className="text-emerald-500">Waived</span>
          </div>

          <div className="flex justify-between text-sm font-black border-t border-zinc-800/50 pt-8">
            <span className="text-zinc-500 uppercase tracking-widest">
              Total Amount
            </span>
            <span className="text-zinc-100 text-2xl tracking-tighter">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {!user ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-20 text-xs font-black uppercase tracking-widest rounded-2xl bg-zinc-800/50 border-zinc-800 text-zinc-500 cursor-not-allowed"
            >
              Login to Purchase
            </Button>
          ) : isPending || isProcessing ? (
            <div className="w-full h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800/50">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : (
            <div className="relative z-0">
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'pay',
                  height: 80,
                }}
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
              />
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="w-full h-20 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-zinc-800/50 border-zinc-800 hover:bg-zinc-800 transition-all"
          >
            Add to Collection
          </Button>
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-800/50 flex items-center justify-around">
          <div className="flex flex-col items-center space-y-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
              Verified
            </span>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
              Instant
            </span>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
              Premium
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}