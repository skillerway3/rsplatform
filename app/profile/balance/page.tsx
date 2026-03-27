'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle2,
  CreditCard,
  DollarSign,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import Link from 'next/link';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  created_at: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = React.useState<{ balance: number; total_earned: number } | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [totalEarned, setTotalEarned] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [showDepositModal, setShowDepositModal] = React.useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [amount, setAmount] = React.useState('10');
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawMethod, setWithdrawMethod] = React.useState('paypal');
  const [withdrawDetails, setWithdrawDetails] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [
        { data: profileData, error: profileError },
        { data: transData, error: transError }
      ] = await Promise.all([
        supabase.from('profiles').select('balance, total_earned').eq('id', user!.id).single(),
        supabase.from('wallet_transactions').select('id, type, amount, status, created_at, reference_id, metadata').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10)
      ]);

      if (profileError) throw profileError;
      if (transError) throw transError;
      setProfile(profileData);
      setTotalEarned(profileData.total_earned || 0);
      setTransactions(transData || []);

    } catch (err: unknown) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [user, authLoading, router, fetchData]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amt > profile.balance) {
      alert('Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          method: withdrawMethod,
          details: withdrawDetails
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
      fetchData();
    } catch (err: unknown) {
      console.error('Withdrawal error:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">

      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Financial Hub</div>
              <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">My Balance</h1>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5"
                onClick={() => setShowWithdrawModal(true)}
              >
                Withdraw
              </Button>
              <Button 
                variant="gold" 
                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20"
                onClick={() => setShowDepositModal(true)}
              >
                Deposit
              </Button>
            </div>
          </header>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="premium-card p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border-amber-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="w-24 h-24 text-amber-500" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Available Balance</p>
                <div className="text-4xl font-black text-white tracking-tighter mb-2">
                  {formatCurrency(profile?.balance || 0)}
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ready for withdrawal</p>
              </div>
            </Card>

            <Card className="premium-card p-8 bg-zinc-900/50 border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Total Earned</p>
              <div className="text-4xl font-black text-zinc-300 tracking-tighter mb-2">
                {formatCurrency(totalEarned)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <TrendingUp className="w-3 h-3" />
                Lifetime Earnings
              </div>
            </Card>

            <Card className="premium-card p-8 bg-zinc-900/50 border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Escrow Active</p>
              <div className="text-4xl font-black text-zinc-300 tracking-tighter mb-2">
                {formatCurrency(0)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Protected Funds
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Transactions List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                    <History className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Recent Activity</h3>
                </div>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-6 bg-zinc-900/30 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-zinc-900/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border",
                          tx.type === 'deposit' || tx.type === 'sale_proceeds' 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                          {tx.type === 'deposit' || tx.type === 'sale_proceeds' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight mb-1">{tx.description || tx.type.replace('_', ' ')}</p>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-black tracking-tighter mb-1",
                          tx.type === 'deposit' || tx.type === 'sale_proceeds' ? "text-emerald-500" : "text-red-500"
                        )}>
                          {tx.type === 'deposit' || tx.type === 'sale_proceeds' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-800 text-zinc-500 rounded-lg">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
                    <History className="w-8 h-8 text-zinc-800" />
                  </div>
                  <h4 className="text-xl font-black text-zinc-500 uppercase tracking-tight mb-2">No Transactions Yet</h4>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-[200px]">Your financial activity will appear here once you start trading.</p>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              <Card className="premium-card p-8 bg-amber-500/5 border-amber-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Secure Payments</h4>
                </div>
                <p className="text-xs font-bold text-zinc-400 leading-relaxed mb-6">
                  All transactions on RSPlatform are protected by our advanced escrow system. Funds are only released when both parties are satisfied.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Fraud Protection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">24/7 Support</span>
                  </div>
                </div>
              </Card>

              <Card className="premium-card p-8">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-6">Payment Methods</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-amber-500/20 flex items-center justify-center group hover:bg-amber-500/5 transition-colors">
                    <div className="text-amber-500 font-black text-[10px] uppercase tracking-widest">PayPal</div>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center opacity-30 grayscale">
                    <CreditCard className="w-6 h-6 text-zinc-500" />
                  </div>
                </div>
                <div className="mt-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">PayPal deposits are fully active.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-950/90" onClick={() => setShowDepositModal(false)} />
          <Card className="relative z-10 w-full max-w-md premium-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Add Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-14 pl-12 pr-4 text-lg font-black text-white focus:outline-none focus:border-amber-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4">
                <PayPalButtons 
                  style={{ layout: "vertical", shape: "rect", label: "pay" }}
                  createOrder={async () => {
                    const res = await fetch("/api/paypal/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount, currency: "USD" }),
                    });
                    const data = await res.json();
                    return data.orderID;
                  }}
                  onApprove={async (data) => {
                    const res = await fetch("/api/paypal/capture-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderID: data.orderID }),
                    });
                    
                    const result = await res.json();
                    if (res.ok) {
                      alert("Deposit successful!");
                      setShowDepositModal(false);
                      fetchData();
                    } else {
                      alert(result.error || "Deposit failed");
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-950/90" onClick={() => setShowWithdrawModal(false)} />
          <Card className="relative z-10 w-full max-w-md premium-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input 
                    required
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-14 pl-12 pr-4 text-lg font-black text-white focus:outline-none focus:border-amber-500/50"
                    placeholder="0.00"
                    max={profile?.balance || 0}
                  />
                </div>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                  Available: {formatCurrency(profile?.balance || 0)}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Withdrawal Method</label>
                <select 
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-12 px-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Crypto (USDT)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Payment Details</label>
                <input 
                  required
                  type="text" 
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-12 px-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50"
                  placeholder="Email or Wallet Address"
                />
              </div>

              <Button 
                type="submit"
                disabled={submitting}
                variant="gold" 
                className="w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Withdrawal'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
