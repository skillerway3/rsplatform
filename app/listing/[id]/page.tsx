'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ShieldCheck,
  Star,
  Zap,
  Clock,
  Info,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { PurchaseCard } from '@/components/listing/PurchaseCard';

type ListingState = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  game: string;
  category: string;
  seller_id: string;
  created_at?: string;
  seller?: {
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    rating: number;
    totalSales: number;
  };
  gameId?: string;
  categoryId?: string;
  deliveryTime?: string;
  deliveryMethod?: string;
};

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [listing, setListing] = React.useState<ListingState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        let sellerProfile: any = null;

        if (data?.seller_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select(
              'id, username, avatar_url, is_verified_seller, average_rating, review_count'
            )
            .eq('id', data.seller_id)
            .maybeSingle();

          if (profileError) throw profileError;
          sellerProfile = profileData;
        }

        const transformedListing: ListingState = {
          ...data,
          gameId: data.game,
          categoryId: data.category,
          deliveryTime: 'Instant Delivery',
          deliveryMethod: 'In-game Trade',
          seller: {
            id: data.seller_id,
            username: sellerProfile?.username || 'Unknown',
            avatar:
              sellerProfile?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.seller_id}`,
            isVerified: sellerProfile?.is_verified_seller || false,
            rating: Number(sellerProfile?.average_rating || 0),
            totalSales: Number(sellerProfile?.review_count || 0),
          },
        };

        setListing(transformedListing);
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        setError(err?.message || 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24">
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading listing...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <Card className="border border-red-500/30 bg-red-500/10">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black">Unable to load listing</h1>
              <p className="mt-3 text-sm text-red-200/80">
                {error || 'This listing could not be found.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => router.back()}
                  className="bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  Go Back
                </Button>
                <Link href="/browse">
                  <Button className="bg-amber-500 text-black hover:bg-amber-400">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => router.back()}
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Link href="/browse">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
              Browse More
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="border border-zinc-800/60 bg-zinc-950/70">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {listing.game}
                  </Badge>
                  <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {listing.category}
                  </Badge>
                  {listing.seller?.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified Seller
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {listing.title}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                  {listing.description || 'Premium marketplace listing.'}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">
                        Delivery
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {listing.deliveryTime || 'Instant Delivery'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">
                        Method
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {listing.deliveryMethod || 'In-game Trade'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Info className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">
                        Price
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-amber-400">
                      {formatCurrency(Number(listing.price || 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-zinc-800/60 bg-zinc-950/70">
              <CardContent className="p-6">
                <h2 className="text-xl font-black">Seller Overview</h2>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-lg font-black text-white">
                    {(listing.seller?.username || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">
                        {listing.seller?.username || 'Unknown seller'}
                      </h3>

                      {listing.seller?.isVerified && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span>{listing.seller?.rating?.toFixed(1) || '0.0'} rating</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>{listing.seller?.totalSales || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
                    Protected by monitored order flow
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
                    Buyer and seller actions tracked
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
                    Dispute-ready order history
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <PurchaseCard listing={listing as any} />
          </div>
        </div>
      </div>
    </div>
  );
}