'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Zap, 
  Clock, 
  Trash2, 
  CheckSquare,
  ChevronRight,
  Package,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update':
      case 'order_status':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'verification_update':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Notifications <span className="text-amber-500">Center</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
              Stay updated with your orders, messages, and account activity
            </p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="rounded-xl text-[9px] font-black uppercase tracking-widest border-zinc-800 hover:bg-zinc-900"
            >
              <CheckSquare className="w-3.5 h-3.5 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-900/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group relative bg-zinc-900/30 border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-zinc-900/50",
                    !notification.is_read && "border-amber-500/20 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-start gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                      notification.is_read ? "bg-zinc-950 border-zinc-800" : "bg-amber-500/10 border-amber-500/20"
                    )}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn(
                          "text-sm font-black uppercase tracking-widest truncate",
                          notification.is_read ? "text-zinc-400" : "text-white"
                        )}>
                          {notification.title}
                        </h3>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-4">
                        {notification.content}
                      </p>

                      <div className="flex items-center gap-4">
                        {notification.link && (
                          <Link 
                            href={notification.link}
                            onClick={() => markAsRead(notification.id)}
                            className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                          >
                            View Details
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                        {!notification.is_read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!notification.is_read && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
            <Bell className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Notifications</h3>
            <p className="text-zinc-500 mb-10 max-w-md mx-auto">
              You&apos;re all caught up! When you have new activity, it will show up here.
            </p>
            <Link href="/dashboard" className="px-10 py-5 bg-zinc-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all border border-white/5">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
