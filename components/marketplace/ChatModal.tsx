'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, User, ShieldCheck, Clock, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  sellerId: string;
  buyerId: string;
  title: string;
}

export function ChatModal({ isOpen, onClose, requestId, sellerId, buyerId, title }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ username: string; is_verified_seller: boolean; is_trusted_seller: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const setupChat = async () => {
      setLoading(true);
      try {
        // Fetch other user profile
        const otherId = user.id === buyerId ? sellerId : buyerId;
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, is_verified_seller, is_trusted_seller')
          .eq('id', otherId)
          .single();
        
        if (profile) setOtherUser(profile);

        // 1. Get or create thread
        const { data: thread, error: threadError } = await supabase
          .from('buyer_request_threads')
          .select('id')
          .eq('request_id', requestId)
          .eq('buyer_id', buyerId)
          .eq('seller_id', sellerId)
          .maybeSingle();

        if (threadError) throw threadError;

        if (!thread) {
          const { data: newThread, error: createError } = await supabase
            .from('buyer_request_threads')
            .insert({
              request_id: requestId,
              buyer_id: buyerId,
              seller_id: sellerId
            })
            .select('id')
            .single();

          if (createError) throw createError;
          thread = newThread;
        }

        if (thread) {
          setThreadId(thread.id);

          // 2. Fetch messages
          const { data: msgs, error: msgsError } = await supabase
            .from('buyer_request_messages')
            .select('id, thread_id, sender_id, message, created_at, read_at')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true });

          if (msgsError) throw msgsError;
          setMessages(msgs || []);

          // 3. Subscribe to new messages
          const subscription = supabase
            .channel(`thread-${thread.id}`)
            .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'buyer_request_messages', 
              filter: `thread_id=eq.${thread.id}` 
            }, (payload) => {
              setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Error setting up chat:', err);
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [isOpen, requestId, buyerId, sellerId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('buyer_request_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/90 z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-4 top-20 md:inset-auto md:right-8 md:bottom-8 md:top-auto md:w-[450px] md:h-[600px] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <User className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest truncate max-w-[200px]">{otherUser?.username || title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </p>
                    {otherUser?.is_verified_seller && (
                      <div className="flex items-center gap-1 px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <ShieldCheck className="w-2 h-2 text-emerald-500" />
                        <span className="text-[6px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                      </div>
                    )}
                    {otherUser?.is_trusted_seller && (
                      <div className="flex items-center gap-1 px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                        <Zap className="w-2 h-2 text-amber-500" />
                        <span className="text-[6px] font-black text-amber-500 uppercase tracking-widest">Trusted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-zinc-800">
                    <ShieldCheck className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No messages yet</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Start the conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isOwn ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm font-medium",
                        isOwn 
                          ? "bg-amber-500 text-zinc-950 rounded-tr-none" 
                          : "bg-zinc-800 text-zinc-100 rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={handleSendMessage}
              className="p-6 border-t border-zinc-800 bg-zinc-900"
            >
              <div className="relative flex items-center gap-3">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 h-12 text-sm font-medium text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-700"
                />
                <Button 
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  variant="gold"
                  size="icon"
                  className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-amber-500/10"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
