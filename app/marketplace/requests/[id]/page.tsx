'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { ShieldCheck, Clock, Zap, MessageSquare, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChatModal } from '@/components/marketplace/ChatModal';
import { createNotification } from '@/lib/notifications';

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

export default function SellerRequestPage() {
  const { id } = useParams();
  const { user, isVerifiedSeller, loading: authLoading } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [hasSubmittedOffer, setHasSubmittedOffer] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [order, setOrder] = useState<any>(null);
  const [proof, setProof] = useState<any>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchRequestAndOrder = async () => {
      try {
        const { data: reqData, error: reqError } = await supabase
          .from('buyer_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (reqError) throw reqError;
        setRequest(reqData);

        // Check if seller already submitted an offer
        const { data: offerData, error: offerError } = await supabase
          .from('buyer_request_offers')
          .select('id, status')
          .eq('request_id', id)
          .eq('seller_id', user.id)
          .maybeSingle();

        if (offerData) {
          setHasSubmittedOffer(true);
          
          // If offer accepted, fetch order
          if (offerData.status === 'accepted') {
            const { data: orderData } = await supabase
              .from('orders')
              .select('*')
              .eq('request_id', id)
              .eq('seller_id', user.id)
              .maybeSingle();
            
            setOrder(orderData);

            // Fetch proof if delivered or completed
            if (orderData?.status === 'delivered' || orderData?.status === 'completed') {
              const { data: proofData } = await supabase
                .from('buyer_request_proofs')
                .select('*')
                .eq('order_id', orderData.id)
                .maybeSingle();
              
              if (proofData) {
                // Get signed URL for the proof file
                const filePath = proofData.file_url.split('/').pop();
                if (filePath) {
                  const { data: signedData } = await supabase.storage
                    .from('verifications')
                    .createSignedUrl(`proofs/${orderData.id}/${filePath}`, 3600);
                  
                  if (signedData) {
                    proofData.signed_url = signedData.signedUrl;
                  }
                }
                setProof(proofData);
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching request:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestAndOrder();
  }, [id, user, authLoading, router]);

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order || !deliveryFile) return;

    setIsSubmitting(true);
    try {
      console.log('Delivering service for order:', order.id);
      // 1. Upload proof file
      const fileExt = deliveryFile.name.split('.').pop();
      const fileName = `proof-${Math.random()}.${fileExt}`;
      const filePath = `proofs/${order.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(filePath, deliveryFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // 2. Create proof record (store the path, not public URL)
      const { error: proofError } = await supabase
        .from('buyer_request_proofs')
        .insert({
          order_id: order.id,
          seller_id: user.id,
          file_url: uploadData.path,
          note: deliveryNote
        });

      if (proofError) {
        console.error('Proof record creation error:', proofError);
        throw proofError;
      }

      // 3. Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', order.id);

      if (orderError) {
        console.error('Order status update error:', orderError);
        throw orderError;
      }

      // 4. Update request status
      if (request?.id) {
        const { error: reqError } = await supabase
          .from('buyer_requests')
          .update({ status: 'delivered' })
          .eq('id', request.id);
        
        if (reqError) console.error('Error updating request status:', reqError);
      }

      // 5. Notify buyer
      await createNotification({
        userId: order.buyer_id,
        type: 'order_delivered',
        title: 'Order Delivered',
        content: `Your order for "${request?.title}" has been delivered. Please review and approve it.`,
        link: `/orders/${order.id}`
      });

      console.log('Service delivered successfully, refreshing data...');
      // Instead of reload, we re-fetch the data
      setLoading(true);
      const { data: reqData } = await supabase
        .from('buyer_requests')
        .select('*')
        .eq('id', id)
        .single();
      if (reqData) setRequest(reqData);

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('request_id', id)
        .eq('seller_id', user.id)
        .maybeSingle();
      if (orderData) {
        setOrder(orderData);
        const { data: proofData } = await supabase
          .from('buyer_request_proofs')
          .select('*')
          .eq('order_id', orderData.id)
          .maybeSingle();
        if (proofData) {
          const filePath = proofData.file_url.split('/').pop();
          if (filePath) {
            const { data: signedData } = await supabase.storage
              .from('verifications')
              .createSignedUrl(`proofs/${orderData.id}/${filePath}`, 3600);
            if (signedData) proofData.signed_url = signedData.signedUrl;
          }
          setProof(proofData);
        }
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error delivering service:', err);
      setError('Failed to deliver service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !request) return;

    if (!isVerifiedSeller) {
      console.log('User not verified, redirecting to verification page');
      router.push('/sell/verify');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting offer for request:', request.id);
      const { error } = await supabase
        .from('buyer_request_offers')
        .insert({
          request_id: request.id,
          seller_id: user.id,
          price: parseFloat(offerPrice),
          delivery_time: deliveryTime,
          message: offerMessage,
          status: 'pending',
        });

      if (error) {
        console.error('Supabase error submitting offer:', error);
        throw error;
      }

      // Notify buyer
      await createNotification({
        userId: request.buyer_id,
        type: 'new_offer',
        title: 'New Offer Received',
        content: `You received a new offer of $${offerPrice} for your request "${request.title}".`,
        link: `/marketplace/requests/${request.id}`
      });

      console.log('Offer submitted successfully');
      setHasSubmittedOffer(true);
    } catch (err: any) {
      console.error('Error submitting offer:', err);
      setError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Request Not Found</h1>
        <p className="text-zinc-500 mb-8">{error || "The request you're looking for doesn't exist or you don't have permission to view it."}</p>
        <Button variant="gold" onClick={() => router.push('/marketplace/requests')}>Back to Marketplace</Button>
      </div>
    );
  }

  const isExpired = new Date(request.expires_at) < new Date();
  const isOpen = request.status === 'open' && !isExpired;

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <Link href="/marketplace/requests" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Request Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                )}>
                  {isOpen ? 'Active Request' : request.status.toUpperCase()}
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">{request.title}</h1>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> {request.game}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Description</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{request.description}</p>
                </div>
              </div>
            </div>

            {/* Offer Form Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                Submit Your Offer
              </h2>

              {order && order.status === 'processing' ? (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">Deliver Service</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Upload proof of delivery to complete the order</p>
                    </div>
                  </div>

                  <form onSubmit={handleDeliver} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Proof File (Image/Video)</label>
                      <div className="relative h-32 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 transition-colors cursor-pointer group">
                        <input 
                          type="file" 
                          required
                          onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {deliveryFile ? (
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4" />
                            {deliveryFile.name}
                          </div>
                        ) : (
                          <>
                            <Zap className="w-6 h-6 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Click to upload proof</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Delivery Note</label>
                      <textarea 
                        required
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="Add any details about the delivery..."
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[100px] resize-none"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting || !deliveryFile}
                      variant="gold" 
                      className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Delivery'}
                    </Button>
                  </form>
                </div>
              ) : order && (order.status === 'delivered' || order.status === 'completed') ? (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">Service Delivered</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        {order.status === 'completed' ? 'Order completed and payment released.' : 'Waiting for buyer to review and approve.'}
                      </p>
                    </div>
                  </div>

                  {proof && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-800/50">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Your Delivery Note</label>
                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 min-h-[100px]">
                          <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">
                            &quot;{proof.note}&quot;
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Submitted Proof</label>
                        <a 
                          href={proof.signed_url || proof.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group block bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all h-[100px]"
                        >
                          <div className="flex items-center justify-between h-full">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">View Proof</p>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Open in new tab</p>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : hasSubmittedOffer ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Offer Submitted</h3>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">You have already submitted an offer for this request.</p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest border-zinc-800 hover:bg-zinc-800"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Chat with Buyer
                  </Button>
                </div>
              ) : !isOpen ? (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem] p-12 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">This request is no longer accepting offers.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Your Price ($)</label>
                      <input 
                        type="number" 
                        required
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Delivery Time</label>
                      <input 
                        type="text" 
                        required
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        placeholder="e.g. 2 days"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {offerPrice && parseFloat(offerPrice) > 0 && (
                    <div className="p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estimated Payout</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">After 5% platform fee</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-amber-500 tracking-tighter">
                          ${(parseFloat(offerPrice) * 0.95).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Message to Buyer</label>
                    <textarea 
                      required
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Describe why you're the best fit for this task..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[150px] resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    variant="gold" 
                    className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10 group/btn"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Submit Offer
                        <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Buyer Info */}
          <div className="space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">Buyer Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                    <ShieldCheck className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Verified Buyer</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Member since 2024</p>
                  </div>
                </div>

                <div className="h-px bg-zinc-800/50" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Transactions</span>
                    <span className="text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Rating</span>
                    <span className="text-white">⭐ 4.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-[2rem] p-6 flex items-start gap-4">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Quick Tip</p>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                  Buyers are more likely to accept offers that include a detailed message and a competitive delivery time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isChatOpen && request && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          requestId={id as string}
          sellerId={user?.id || ''}
          buyerId={request.buyer_id}
          title={`Chat with Buyer`}
        />
      )}
    </div>
  );
}
