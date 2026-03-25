'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  ChevronRight,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Star,
  CheckCircle,
  ShieldCheck,
  Flag,
  UserPlus,
  ArrowLeft,
  Send,
  MoreVertical,
  ExternalLink,
  History,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminSupportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [thread, setThread] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchThreadDetail() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const [
          { data: threadData, error: threadError },
          { data: messagesData }
        ] = await Promise.all([
          supabase.from('support_threads').select(`
            *,
            user:profiles!support_threads_user_id_fkey(*),
            assigned_admin:profiles!support_threads_assigned_to_fkey(*)
          `).eq('id', id).single(),
          supabase.from('support_messages').select(`
            *,
            sender:profiles!support_messages_sender_id_fkey(*)
          `).eq('thread_id', id).order('created_at', { ascending: true })
        ]);

        if (threadError) throw threadError;

        setThread(threadData);
        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error fetching thread detail:', error);
        router.push('/admin/support');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchThreadDetail();

    // Subscribe to new messages
    const channel = supabase
      .channel(`support_thread_${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `thread_id=eq.${id}`
      }, async (payload) => {
        const { data: newMessageData } = await supabase
          .from('support_messages')
          .select(`*, sender:profiles!support_messages_sender_id_fkey(*)`)
          .eq('id', payload.new.id)
          .single();
        
        if (newMessageData) {
          setMessages(prev => [...prev, newMessageData]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert({
        thread_id: id,
        sender_id: currentUser.id,
        content: newMessage,
        sender_type: 'admin'
      });

      if (error) throw error;

      // Update thread last_message_at
      await supabase.from('support_threads').update({ 
        last_message_at: new Date().toISOString(),
        status: thread.status === 'open' ? 'pending' : thread.status
      }).eq('id', id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateThread = async (updates: any) => {
    try {
      const { error } = await supabase.from('support_threads').update(updates).eq('id', id);
      if (error) throw error;
      setThread({ ...thread, ...updates });
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/support">
            <button className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex flex-col space-y-1">
            <h1 className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-[300px]">{thread.subject}</h1>
            <div className="flex items-center space-x-3">
              <span className={cn(
                "px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-widest",
                thread.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                thread.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-zinc-800 text-zinc-500 border-white/5'
              )}>
                {thread.status}
              </span>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Priority: {thread.priority}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!thread.assigned_to ? (
            <Button 
              variant="gold" 
              size="sm" 
              className="rounded-xl h-10"
              onClick={() => handleUpdateThread({ assigned_to: currentUser.id, status: 'pending' })}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Claim Ticket
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-950">
                  <Image 
                    src={thread.assigned_admin?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.assigned_to}`}
                    alt={thread.assigned_admin?.username}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{thread.assigned_admin?.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => handleUpdateThread({ status: 'resolved' })}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex items-start space-x-4 max-w-[80%]",
                  msg.sender_id === currentUser.id ? "ml-auto flex-row-reverse space-x-reverse" : ""
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-zinc-950">
                  <Image 
                    src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`}
                    alt={msg.sender?.username}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className={cn(
                  "flex flex-col space-y-1",
                  msg.sender_id === currentUser.id ? "items-end" : "items-start"
                )}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{msg.sender?.username}</span>
                    <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-widest">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed",
                    msg.sender_type === 'admin' ? "bg-amber-500 text-zinc-950 rounded-tr-none" : "bg-zinc-950 text-zinc-300 border border-white/5 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-zinc-950/50 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <input 
                type="text"
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
              <Button 
                type="submit" 
                variant="gold" 
                className="w-14 h-14 rounded-2xl flex items-center justify-center p-0"
                disabled={isSending || !newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          {/* User Info */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">User Profile</h3>
            <Link href={`/admin/users/${thread.user_id}`} className="flex items-center space-x-4 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 group-hover:border-amber-500/30 transition-all">
                <Image 
                  src={thread.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.user_id}`}
                  alt={thread.user?.username}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white uppercase tracking-widest truncate group-hover:text-amber-500 transition-colors">{thread.user?.username}</p>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest truncate">{thread.user?.full_name || 'No Full Name'}</p>
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-amber-500 transition-colors" />
            </Link>
            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Verified</span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  thread.user?.is_verified_seller ? "text-emerald-500" : "text-zinc-600"
                )}>{thread.user?.is_verified_seller ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[9px] font-black text-white">{thread.user?.average_rating || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ticket Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Created</span>
                </div>
                <span className="text-[10px] font-medium text-white">{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Last Activity</span>
                </div>
                <span className="text-[10px] font-medium text-white">{new Date(thread.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Moderation</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest">
                <Lock className="w-3 h-3 mr-2" />
                Close Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest">
                <Trash2 className="w-3 h-3 mr-2" />
                Delete Thread
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
