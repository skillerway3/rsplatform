'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ChevronRight,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Ban,
  MoreVertical,
  ExternalLink,
  History,
  MessageSquare,
  CreditCard,
  User,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    async function fetchOrderDetail() {
      try {
        const [
          { data: orderData, error: orderError },
          { data: historyData },
          { data: logsData }
        ] = await Promise.all([
          supabase.from('orders').select(`
            *,
            buyer:profiles!orders_buyer_id_fkey(*),
            seller:profiles!orders_seller_id_fkey(*),
            listing:listings(*)
          `).eq('id', id).single(),
          supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: false }),
          supabase.from('transaction_logs').select('*').eq('order_id', id).order('created_at', { ascending: false })
        ]);

        if (orderError) throw orderError;

        setOrder(orderData);
        setHistory(historyData || []);
        setLogs(logsData || []);
      } catch (error) {
        console.error('Error fetching order detail:', error);
        router.push('/admin/orders');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      // Log the action in order_status_history
      await supabase.from('order_status_history').insert({
        order_id: id,
        old_status: order.status,
        new_status: newStatus,
        changed_by: (await supabase.auth.getUser()).data.user?.id,
        reason: 'Administrative action'
      });

      setOrder({ ...order, status: newStatus });
      
      // Refresh history
      const { data: newHistory } = await supabase.from('order_status_history').select('*').eq('order_id', id).order('created_at', { ascending: false });
      setHistory(newHistory || []);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'disputed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-zinc-800 text-zinc-500 border-white/5';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/orders">
            <button className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Order: {order.order_code || order.id.substr(0, 12)}</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Transaction ID: {order.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            {['pending', 'completed', 'cancelled', 'disputed'].map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                disabled={isUpdating || order.status === s}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  order.status === s ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white disabled:opacity-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Details */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
                  <Image 
                    src={order.listing?.image_url || 'https://picsum.photos/seed/listing/200/200'}
                    alt={order.listing?.title}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">{order.listing?.title}</h2>
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-widest",
                      getStatusColor(order.status)
                    )}>
                      {order.status}
                    </span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Qty: {order.quantity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Amount</p>
                <div className="flex items-center justify-end space-x-1">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span className="text-2xl font-black text-white">{order.total_price}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Buyer Details</h3>
                <Link href={`/admin/users/${order.buyer_id}`} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 group-hover:border-amber-500/30 transition-all">
                    <Image 
                      src={order.buyer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.buyer_id}`}
                      alt={order.buyer?.username}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-amber-500 transition-colors">{order.buyer?.username}</p>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{order.buyer?.full_name || 'No Full Name'}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Seller Details</h3>
                <Link href={`/admin/users/${order.seller_id}`} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 group-hover:border-amber-500/30 transition-all">
                    <Image 
                      src={order.seller?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.seller_id}`}
                      alt={order.seller?.username}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-amber-500 transition-colors">{order.seller?.username}</p>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{order.seller?.full_name || 'No Full Name'}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Transaction Logs */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Payment Logs</h3>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-zinc-500 text-xs font-medium">No transaction logs found for this order.</p>
                </div>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                        <Tag className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{log.action_type.replace(/_/g, ' ')}</p>
                        <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Provider: {log.payment_provider || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">${log.amount}</p>
                      <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline and Actions */}
        <div className="lg:col-span-1 space-y-8">
          {/* Order Timeline */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center space-x-3">
              <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-white/5">
                <History className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Order Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                {history.map((item: any, idx: number) => (
                  <div key={item.id} className="relative pl-10">
                    <div className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900 z-10",
                      idx === 0 ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {idx === 0 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        idx === 0 ? "text-white" : "text-zinc-500"
                      )}>
                        {item.new_status}
                      </p>
                      <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      {item.reason && (
                        <p className="text-[9px] font-medium text-zinc-600 italic">"{item.reason}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Admin Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-white/5 text-zinc-400 hover:text-white hover:bg-white/5">
                <MessageSquare className="w-4 h-4 mr-3" />
                Contact Buyer
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-white/5 text-zinc-400 hover:text-white hover:bg-white/5">
                <MessageSquare className="w-4 h-4 mr-3" />
                Contact Seller
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10">
                <AlertCircle className="w-4 h-4 mr-3" />
                Open Dispute
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
