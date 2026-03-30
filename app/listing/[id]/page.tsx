'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  Lock,
  MessageSquare,
  Share2,
  ShieldAlert,
  Clock,
  CheckCircle,
  Trophy,
  UserCheck,
  ArrowRight,
  Info,
  Loader2,
  AlertCircle,
  X,
  Package
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'motion/react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

import { PayPalButtons } from "@paypal/react-paypal-js";

interface Seller {
  id: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isTrusted: boolean;
  rating: number;
  totalSales: number;
}

interface ListingMetadata {
  build?: string;
  type?: string;
  totalLevel?: string;
  loginMethod?: string;
  highlights?: string[];
  notes?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  game: string;
  category: string;
  images: string[];
  seller_id: string;
  created_at: string;
  gameId: string;
  categoryId: string;
  deliveryTime: string;
  deliveryMethod: string;
  seller: Seller;
  metadata?: ListingMetadata;
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePurchase = async (paypalOrderId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          paypalOrderId: paypalOrderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await response.json();
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        // Fetch listing first
        const { data: listingData, error: fetchError } = await supabase
          .from('listings')
          .select('id, title, description, price, game, category, status, seller_id, created_at, metadata, images')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        
        // Fetch seller profile separately
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('username, avatar_url, is_verified_seller, is_trusted_seller, average_rating, review_count')
          .eq('id', listingData.seller_id)
          .single();

        const transformedListing: Listing = {
          ...listingData,
          gameId: listingData.game,
          categoryId: listingData.category,
          deliveryTime: 'Instant Delivery',
          deliveryMethod: 'In-game Trade',
          seller: {
            id: listingData.seller_id,
            username: sellerData?.username || 'Unknown',
            avatar: sellerData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listingData.seller_id}`,
            isVerified: sellerData?.is_verified_seller || false,
            isTrusted: sellerData?.is_trusted_seller || false,
            rating: sellerData?.average_rating || 0,
            totalSales: sellerData?.review_count || 0,
          }
        };

        setListing(transformedListing);
      } catch (err: unknown) {
        console.error('Error fetching listing:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Accessing Dossier...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-4">Listing Not Found</h2>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl border-white/10">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const seller = listing.seller;
  const isAccount = listing.categoryId === 'accounts';
  const metadata = listing.metadata;

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows - Simplified for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-100 -ml-4 group"
          >
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Marketplace
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest px-3 py-1">
              Listing ID: {listing.id}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Media & Details */}
          <div className="lg:col-span-8 space-y-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="aspect-video relative rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900/50 shadow-2xl group flex items-center justify-center">
                {listing.images && listing.images.length > 0 ? (
                  <Image 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Package className="w-24 h-24 text-zinc-800" />
                )}
                <div className="absolute top-8 left-8 flex space-x-3">
                  <Badge variant="gold" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    {listing.gameId}
                  </Badge>
                  <Badge className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/60 border border-white/10 shadow-xl">
                    {listing.categoryId}
                  </Badge>
                </div>
              </div>

              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {listing.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/50 hover:border-amber-500/50 transition-colors cursor-pointer group">
                      <Image 
                        src={img} 
                        alt={`${listing.title} ${i + 2}`} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-[0.9] max-w-4xl">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle className="w-3 h-3" />
                    Verified Listing
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" />
                    Shield Protected
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 text-xl leading-relaxed max-w-3xl font-medium">
                {listing.description}
              </p>
            </div>

            {/* Account Specific Details */}
            {isAccount && metadata && (
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-900" />
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Account Dossier</h3>
                  <div className="h-px flex-1 bg-zinc-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Account Build', value: metadata.build, icon: Trophy },
                      { label: 'Account Type', value: metadata.type, icon: Zap },
                      { label: 'Total Level', value: metadata.totalLevel, icon: Star },
                      { label: 'Login Method', value: metadata.loginMethod, icon: Lock },
                    ].map((spec, i) => (
                      <div key={i} className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-6 space-y-4 hover:border-zinc-800 transition-colors group">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                          <spec.icon className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{spec.label}</div>
                          <div className="text-zinc-100 font-bold text-lg tracking-tight">{spec.value}</div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-zinc-950/50 border border-zinc-900 rounded-[2rem] p-10 space-y-8">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center">
                      <Zap className="w-4 h-4 mr-3 text-amber-500" />
                      Account Highlights
                    </h3>
                    <div className="grid grid-cols-1 gap-y-4">
                      {metadata?.highlights?.map((highlight: string, i: number) => (
                        <div key={i} className="flex items-center text-zinc-300 font-bold group">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-950/50 border border-zinc-900 rounded-[2rem] p-10 space-y-8">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center">
                      <Info className="w-4 h-4 mr-3 text-blue-500" />
                      Seller Notes
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      {metadata.notes || "No additional notes provided by the seller for this account listing."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trust & Safety Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-zinc-950/50 border border-zinc-900 rounded-[2.5rem]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Clock className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Delivery Time</div>
                  <div className="text-zinc-100 font-bold text-lg">{listing.deliveryTime}</div>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Guaranteed Window</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Secure Method</div>
                  <div className="text-zinc-100 font-bold text-lg">{listing.deliveryMethod}</div>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Encrypted Transfer</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">RSPlatform Shield</div>
                  <div className="text-zinc-100 font-bold text-lg">100% Protected</div>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Buyer Guarantee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Purchase & Seller */}
          <div className="lg:col-span-4 space-y-8">
            {/* Purchase Card */}
            <div className="sticky top-32 space-y-8">
              <Card className="border-zinc-800 bg-zinc-950/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Market Price</div>
                      <Badge variant="gold" className="text-[8px] font-black uppercase tracking-widest animate-pulse">Hot Deal</Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-zinc-100 tracking-tighter">
                        {formatCurrency(listing.price)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!showCheckout ? (
                      <div className="group/btn relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-20 group-hover/btn:opacity-40 transition duration-500" />
                        <Button 
                          onClick={() => setShowCheckout(true)}
                          className="relative w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-[0.2em] text-sm transition-all duration-300"
                        >
                          Purchase {isAccount ? 'Account' : 'Item'}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <PayPalButtons 
                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 56 }}
                            disabled={isProcessing}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [
                                  {
                                    amount: {
                                      value: listing.price.toString(),
                                      currency_code: "USD"
                                    },
                                    description: `Purchase: ${listing.title}`
                                  }
                                ]
                              });
                            }}
                            onApprove={async (data, actions) => {
                              if (actions.order) {
                                await handlePurchase(data.orderID);
                              }
                            }}
                            onCancel={() => setShowCheckout(false)}
                          />
                        <Button 
                          variant="ghost" 
                          onClick={() => setShowCheckout(false)}
                          className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-100 font-black uppercase tracking-[0.2em] text-sm transition-all">
                      Add to Cart
                    </Button>
                  </div>

                  <div className="pt-10 border-t border-zinc-900 space-y-5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-600">Marketplace Fee</span>
                      <span className="text-emerald-500">Free</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-600">Buyer Protection</span>
                      <span className="text-zinc-300">Included</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-black text-zinc-100 tracking-tight uppercase">
                      <span>Total Due</span>
                      <span className="text-amber-500">{formatCurrency(listing.price)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Verified Secure Checkout</span>
                    </div>
                    <div className="flex gap-4 opacity-30 grayscale">
                      {/* Placeholder for payment icons */}
                      <div className="w-8 h-5 bg-zinc-700 rounded" />
                      <div className="w-8 h-5 bg-zinc-700 rounded" />
                      <div className="w-8 h-5 bg-zinc-700 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              <Card className="border-zinc-900 bg-zinc-950/40 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Merchant Profile</h3>
                    {seller.isVerified && (
                      <div className="flex items-center gap-1.5 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                        <UserCheck className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    {seller.isTrusted && (
                      <div className="flex items-center gap-1.5 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                        <Zap className="w-3 h-3" />
                        Trusted
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 relative rounded-[1.5rem] overflow-hidden border-2 border-zinc-800 shadow-2xl">
                      <Image src={seller.avatar} alt={seller.username} fill className="object-cover" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-2xl font-black text-zinc-100 tracking-tighter uppercase">{seller.username}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          <span className="text-sm font-black">{seller.rating}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{seller.totalSales} Sales</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="rounded-2xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest h-14">
                      <MessageSquare className="w-4 h-4 mr-2 text-amber-500" />
                      Message
                    </Button>
                    <Button variant="outline" className="rounded-2xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest h-14">
                      Storefront
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-center space-x-10">
                <button className="flex items-center text-zinc-600 hover:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                  <Share2 className="w-3.5 h-3.5 mr-2 transition-transform group-hover:scale-110" />
                  Share
                </button>
                <button className="flex items-center text-zinc-600 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2 transition-transform group-hover:scale-110" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-8 right-8 z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-black uppercase tracking-widest">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
