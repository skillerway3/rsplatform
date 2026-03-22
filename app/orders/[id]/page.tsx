'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ShieldCheck, Clock, Zap, MessageSquare, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ExternalLink, ChevronRight, Truck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChatModal } from '@/components/marketplace/ChatModal';
import { motion } from 'motion/react';

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  expires_at: string;
  game: string;
  category: string;
  buyer_id: string;
}

interface Offer {
  id: string;
  seller_id: string;
  price: number;
  delivery_time: string;
  message: string;
  status: string;
  created_at: string;
  profiles?: {
    username: string;
    is_verified_seller: boolean;
    avatar_url: string;
    average_rating: number;
    review_count: number;
  };
}

export default function OrderPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<{ sellerId: string; title: string } | null>(null);
  const [closing, setClosing] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [delivering, setDelivering] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [review, setReview] = useState<any>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [orderType, setOrderType] = useState<'direct' | 'request' | null>(null);
  const [listing, setListing] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const mergeOffersWithProfiles = async (offersData: any[]) => {
      if (!offersData || offersData.length === 0) return [];
      const sellerIds = Array.from(new Set(offersData.map((o: any) => o.seller_id)));
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, is_verified_seller, avatar_url, average_rating, review_count')
        .in('id', sellerIds);
      
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      return offersData.map((offer: any) => ({
        ...offer,
        profiles: profilesMap[offer.seller_id]
      }));
    };

    try {
      setLoading(true);
      setError(null);
      // 1. Try to fetch as an order first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, listings(*)')
        .eq('id', id)
        .maybeSingle();

      if (orderData) {
        setOrder(orderData);
        
        // If it's a direct listing purchase
        if (orderData.listing_id) {
          setOrderType('direct');
          setListing(orderData.listings);
        } 
        // If it's a buyer request order
        else if (orderData.request_id) {
          setOrderType('request');
          const { data: reqData } = await supabase
            .from('buyer_requests')
            .select('*')
            .eq('id', orderData.request_id)
            .single();
          
          if (reqData) setRequest(reqData);

          const { data: offersData } = await supabase
            .from('buyer_request_offers')
            .select('*')
            .eq('request_id', orderData.request_id);
          
          if (offersData) {
            const merged = await mergeOffersWithProfiles(offersData);
            setOffers(merged);
          }
        }

        // Fetch proof if delivered or completed
        if (orderData.status === 'delivered' || orderData.status === 'completed') {
          const { data: proofData } = await supabase
            .from('buyer_request_proofs')
            .select('*')
            .eq('order_id', orderData.id)
            .maybeSingle();
          
          if (proofData) {
            const filePath = proofData.file_url?.split('/').pop();
            if (filePath) {
              const { data: signedData } = await supabase.storage
                .from('verifications')
                .createSignedUrl(`proofs/${orderData.id}/${filePath}`, 3600);
              
              if (signedData) proofData.signed_url = signedData.signedUrl;
            }
            setProof(proofData);
          }

          if (orderData.status === 'completed') {
            const { data: reviewData } = await supabase
              .from('seller_reviews')
              .select('*')
              .eq('order_id', orderData.id)
              .maybeSingle();
            
            setReview(reviewData);
          }
        }
        return;
      }

      // 2. If not an order, try to fetch as a buyer request (pre-order state)
      const { data: reqData, error: reqError } = await supabase
        .from('buyer_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (reqError) throw reqError;
      setOrderType('request');
      setRequest(reqData);

      const { data: offersData, error: offersError } = await supabase
        .from('buyer_request_offers')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;
      
      if (offersData) {
        const merged = await mergeOffersWithProfiles(offersData);
        setOffers(merged);
      }

      if (reqData.status === 'matched' || reqData.status === 'in_progress' || reqData.status === 'delivered' || reqData.status === 'completed') {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('request_id', id)
          .maybeSingle();
        
        if (orderData) setOrder(orderData);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setIsAuthReady(true);
    fetchData();

    // Subscribe to new offers
    const subscription = supabase
      .channel(`request-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buyer_request_offers', filter: `request_id=eq.${id}` }, async (payload) => {
        const newOffer = payload.new as Offer;
        
        // Fetch profile for the new offer
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, is_verified_seller, avatar_url, average_rating, review_count')
          .eq('id', newOffer.seller_id)
          .single();
        
        if (profileData) {
          newOffer.profiles = profileData;
        }
        
        setOffers(prev => [newOffer, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, user, authLoading, router, fetchData]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    setSubmittingReview(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('seller_reviews')
        .insert({
          order_id: order.id,
          seller_id: order.seller_id,
          buyer_id: user.id,
          rating,
          review_text: reviewText
        })
        .select()
        .single();

      if (error) throw error;
      setReview(data);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed', resolved_at: new Date().toISOString() })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // 2. Update request status if it's a request-based order
      if (order.request_id) {
        const { error: reqError } = await supabase
          .from('buyer_requests')
          .update({ status: 'completed' })
          .eq('id', order.request_id);
        
        if (reqError) console.error('Error updating request status:', reqError);
      }

      await fetchData();
    } catch (err: any) {
      console.error('Error approving order:', err);
      setError('Failed to approve order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('orders')
        .update({ status: 'disputed' })
        .eq('id', order.id);

      if (error) throw error;

      await fetchData();
    } catch (err: any) {
      console.error('Error opening dispute:', err);
      setError('Failed to open dispute.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offer: Offer, paypalOrderId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          offerId: offer.id,
          paypalOrderId: paypalOrderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept offer');
      }

      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
        return;
      }

      await fetchData();
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      setError(err.message || 'Failed to accept offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !deliveryFile) return;

    setDelivering(true);
    setError(null);
    try {
      // 1. Upload proof file
      const fileExt = deliveryFile.name.split('.').pop();
      const fileName = `proofs/${order.id}/proof-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, deliveryFile);

      if (uploadError) throw uploadError;

      // 2. Create proof record (store the path, not public URL)
      const { error: proofError } = await supabase
        .from('buyer_request_proofs')
        .insert({
          order_id: order.id,
          seller_id: user!.id,
          file_url: uploadData.path,
          note: deliveryNote
        });

      if (proofError) throw proofError;

      // 3. Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // 4. Update request status if it's a request-based order
      if (order.request_id) {
        const { error: reqError } = await supabase
          .from('buyer_requests')
          .update({ status: 'delivered' })
          .eq('id', order.request_id);
        
        if (reqError) console.error('Error updating request status:', reqError);
      }

      await fetchData();
    } catch (err: any) {
      console.error('Error delivering order:', err);
      setError('Failed to deliver order.');
    } finally {
      setDelivering(false);
    }
  };

  const handleCloseRequest = async () => {
    if (!id || !user) return;
    setClosing(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('buyer_requests')
        .update({ status: 'closed' })
        .eq('id', id)
        .eq('buyer_id', user.id);

      if (error) throw error;
      setRequest(prev => prev ? { ...prev, status: 'closed' } : null);
    } catch (err) {
      console.error('Error closing request:', err);
      setError('Failed to close request');
    } finally {
      setClosing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || (!request && !order)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Order Not Found</h1>
        <p className="text-zinc-500 mb-8 text-center max-w-md">{error || "The order or request you're looking for doesn't exist or you don't have permission to view it."}</p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => fetchData()} 
            className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-800"
          >
            Retry
          </Button>
          <Button 
            variant="gold" 
            onClick={() => router.push('/dashboard')} 
            className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = request ? new Date(request.expires_at) < new Date() : false;
  const isOpen = request ? request.status === 'open' && !isExpired : false;
  const isBuyer = user?.id === (request?.buyer_id || order?.buyer_id);
  const isSeller = order && user?.id === order.seller_id;

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Order/Request Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                )}>
                  {orderType === 'direct' ? 'Direct Purchase' : (isOpen ? 'Active Request' : request?.status?.toUpperCase())}
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                  {orderType === 'direct' ? listing?.title : request?.title}
                </h1>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> {orderType === 'direct' ? listing?.game : request?.game}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(orderType === 'direct' ? order?.created_at : (request?.created_at || Date.now())).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Description</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {orderType === 'direct' ? listing?.description : request?.description}
                  </p>
                </div>
              </div>
            </div>

            {order && order.status === 'completed' && isBuyer && (
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Order Completed</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {review ? 'Thank you for your feedback!' : 'How was your experience with this seller?'}
                    </p>
                  </div>
                </div>

                {!review ? (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rating</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star: number) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={cn(
                              "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                              rating >= star 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                                : "bg-zinc-950/50 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                            )}
                          >
                            <Zap className={cn("w-5 h-5", rating >= star ? "fill-amber-500" : "")} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Review (Optional)</label>
                      <textarea 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[100px]"
                      />
                    </div>

                    <Button 
                      type="submit"
                      variant="gold" 
                      className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10"
                      disabled={submittingReview}
                    >
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                    </Button>
                  </form>
                ) : (
                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star: number) => (
                        <Zap 
                          key={star} 
                          className={cn("w-4 h-4", review.rating >= star ? "text-amber-500 fill-amber-500" : "text-zinc-800")} 
                        />
                      ))}
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-zinc-400 font-medium italic">&quot;{review.review_text}&quot;</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {order && order.status === 'delivered' && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Review Delivery</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">The seller has delivered the service. Please review the proof.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-800"
                      onClick={handleDispute}
                      disabled={loading}
                    >
                      Dispute
                    </Button>
                    <Button 
                      variant="gold" 
                      className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={handleApprove}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Release'}
                    </Button>
                  </div>
                </div>

                {proof && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Seller Note</p>
                      <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-6">
                        <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">
                          &quot;{proof.note}&quot;
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Proof File</p>
                      <a 
                        href={proof.signed_url || proof.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group block bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ExternalLink className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">View Delivery Proof</p>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Click to open in new tab</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Offers/Purchase Details Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">
                  {orderType === 'direct' ? 'Purchase Details' : (order ? 'Accepted Offer' : `Offers (${offers.length})`)}
                </h2>
                {isOpen && isBuyer && (
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Select an offer to start the order
                  </div>
                )}
              </div>

              {orderType === 'direct' ? (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between p-6 bg-zinc-950/50 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Amount Paid</p>
                      <p className="text-2xl font-black text-amber-500">${order?.total_price?.toFixed(2)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Delivery Method</p>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">{listing?.delivery_method || 'Standard'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {offers.map((offer: Offer) => {
                    const isAccepted = order?.seller_id === offer.seller_id;
                    if (order && !isAccepted) return null; // Only show accepted offer if order exists

                    return (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group bg-zinc-900/40 border rounded-[2rem] p-8 transition-all hover:bg-zinc-900/60",
                          isAccepted ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-zinc-800/50"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-xl font-black text-zinc-400">
                              {offer.profiles?.username?.[0].toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest">
                                  {offer.profiles?.username || 'Anonymous Seller'}
                                </h3>
                                {offer.profiles?.is_verified_seller && (
                                  <div className="bg-emerald-500/10 text-emerald-500 p-1 rounded-lg">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                {offer.profiles && offer.profiles.average_rating > 0 && (
                                  <div className="flex items-center gap-1 ml-2">
                                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-amber-500">{Number(offer.profiles.average_rating).toFixed(1)}</span>
                                    <span className="text-[9px] font-bold text-zinc-600">({offer.profiles.review_count})</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Delivery: {offer.delivery_time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Offer Price</p>
                              <p className="text-2xl font-black text-amber-500 tracking-tighter">${offer.price}</p>
                            </div>
                            {isOpen && isBuyer && (
                              <div className="w-64">
                                  <PayPalButtons 
                                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 44 }}
                                    createOrder={(data: any, actions: any) => {
                                      return actions.order.create({
                                        purchase_units: [
                                          {
                                            amount: {
                                              value: offer.price.toString(),
                                              currency_code: "USD"
                                            },
                                            description: `Offer for: ${request?.title || 'Custom Request'}`
                                          }
                                        ]
                                      });
                                    }}
                                    onApprove={async (data, actions) => {
                                      if (actions.order) {
                                        await handleAcceptOffer(offer, data.orderID);
                                      }
                                    }}
                                  />
                              </div>
                            )}
                            {isAccepted && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Accepted</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-zinc-800/50">
                          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                            {offer.message}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {offers.length === 0 && !order && (
                    <div className="bg-zinc-900/40 border border-zinc-800/50 border-dashed rounded-[2.5rem] p-16 text-center">
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8 text-zinc-700" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">No offers yet</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                        Sellers will start submitting offers soon.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Status & Info */}
          <div className="space-y-8">
            {isSeller && order && order.status === 'processing' && (
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Deliver Order</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Upload proof of service completion.</p>
                  </div>
                </div>

                <form onSubmit={handleDeliver} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Delivery Note</label>
                    <textarea 
                      required
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Explain what was delivered..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Proof File (Screenshot/Log)</label>
                    <label className="block">
                      <input 
                        type="file" 
                        required
                        className="hidden" 
                        onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)} 
                      />
                      <div className={cn(
                        "w-full h-14 rounded-2xl border border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest",
                        deliveryFile ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-amber-500/30 hover:text-amber-500"
                      )}>
                        {deliveryFile ? <><CheckCircle2 className="w-4 h-4" /> {deliveryFile.name}</> : <><Upload className="w-4 h-4" /> Select File</>}
                      </div>
                    </label>
                  </div>

                  <Button 
                    type="submit"
                    variant="gold" 
                    className="w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10"
                    disabled={delivering}
                  >
                    {delivering ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Delivery'}
                  </Button>
                </form>
              </div>
            )}

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">
                {orderType === 'direct' ? 'Order Status' : 'Request Status'}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                    (order || isOpen) ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  )}>
                    {(order || isOpen) ? <Zap className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">
                      {order ? `ORDER: ${order.status.toUpperCase()}` : (isOpen ? 'Open for Offers' : request?.status.toUpperCase())}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      {orderType === 'direct' ? 'Direct listing purchase' : (isOpen ? `Expires in ${Math.max(0, Math.floor((new Date(request?.expires_at || Date.now()).getTime() - Date.now()) / 3600000))} hours` : 'Request finalized')}
                    </p>
                  </div>
                </div>

                {isOpen && isBuyer && (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all"
                    onClick={handleCloseRequest}
                    disabled={closing}
                  >
                    {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Close Request'}
                  </Button>
                )}

                <div className="h-px bg-zinc-800/50" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Total Offers</span>
                    <span className="text-white">{offers.length}</span>
                  </div>
                  {order && (
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-500">Order Price</span>
                      <span className="text-amber-500 font-black">${order.total_price}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-6 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Secure Transaction</p>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                  Your payment is only released to the seller once you confirm the service is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeChat && (
        <ChatModal
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          requestId={id as string}
          sellerId={activeChat.sellerId}
          buyerId={user?.id || ''}
          title={activeChat.title}
        />
      )}
    </div>
  );
}
