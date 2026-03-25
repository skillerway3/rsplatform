"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ArrowLeft,
  User,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function AdminWithdrawalsPage() {
  const supabase = createClient();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  async function fetchWithdrawals() {
    setLoading(true);
    try {
      let query = supabase
        .from("wallet_transactions")
        .select(`
          *,
          profiles:user_id (id, email, full_name, username)
        `)
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess(id: string, action: "approve" | "reject") {
    if (!adminNotes && action === "reject") {
      alert("Please provide a reason for rejection in the notes.");
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes }),
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Withdrawal ${action}d successfully`);
        setSelectedTx(null);
        setAdminNotes("");
        fetchWithdrawals();
      } else {
        alert(result.error || "Failed to process withdrawal");
      }
    } catch (err) {
      console.error("Error processing withdrawal:", err);
    } finally {
      setProcessingId(null);
    }
  }

  const filteredWithdrawals = withdrawals.filter(tx => 
    tx.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    tx.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    tx.id.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link 
              href="/admin" 
              className="flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors mb-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Wallet className="w-8 h-8 mr-3 text-[#D4AF37]" />
              Withdrawal Management
            </h1>
            <p className="text-gray-400 mt-1">Review and process user withdrawal requests.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search user or ID..."
                className="bg-[#1A1A1A] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="bg-[#1A1A1A] border border-white/10 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-bottom border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">User</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37] mb-2" />
                      <p className="text-gray-400">Loading requests...</p>
                    </td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                      <p className="text-gray-400">No withdrawal requests found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{tx.profiles?.full_name || tx.profiles?.username || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{tx.profiles?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-red-400">
                          -${Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                        <div className="text-xs opacity-50">{new Date(tx.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {tx.status === 'pending' ? (
                          <button 
                            onClick={() => setSelectedTx(tx)}
                            className="bg-[#D4AF37] hover:bg-[#B8962E] text-black px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                          >
                            Process
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedTx(tx)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedTx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Withdrawal Details</h2>
                  <button onClick={() => setSelectedTx(null)} className="text-gray-500 hover:text-white">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1">User</div>
                      <div className="font-medium">{selectedTx.profiles?.full_name}</div>
                      <div className="text-xs text-gray-400">{selectedTx.profiles?.email}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 uppercase font-bold mb-1">Amount</div>
                      <div className="text-xl font-bold text-red-400">-${Math.abs(selectedTx.amount).toFixed(2)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Transaction ID</div>
                    <div className="text-sm font-mono bg-black/30 p-2 rounded border border-white/5 break-all">
                      {selectedTx.id}
                    </div>
                  </div>

                  {selectedTx.status === 'pending' ? (
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Admin Notes / Reason</label>
                      <textarea 
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors h-24 resize-none"
                        placeholder="Add notes for the user or internal record..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Processed At</div>
                        <div className="text-sm">{selectedTx.processed_at ? new Date(selectedTx.processed_at).toLocaleString() : "N/A"}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Admin Notes</div>
                        <div className="text-sm italic text-gray-300">"{selectedTx.admin_notes || "No notes provided"}"</div>
                      </div>
                    </div>
                  )}

                  {selectedTx.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => handleProcess(selectedTx.id, "reject")}
                        disabled={!!processingId}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {processingId === selectedTx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        Reject & Refund
                      </button>
                      <button 
                        onClick={() => handleProcess(selectedTx.id, "approve")}
                        disabled={!!processingId}
                        className="flex-1 bg-[#D4AF37] hover:bg-[#B8962E] text-black py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      >
                        {processingId === selectedTx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Approve & Process
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
