'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 transition-all rounded-xl relative group",
          isOpen ? "text-amber-500 bg-amber-500/10" : "text-zinc-100 hover:text-amber-500"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute top-1 right-1 h-4 bg-amber-500 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-950",
            unreadCount > 99 ? "px-1 min-w-[20px]" : "w-4"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full right-[-1rem] md:right-0 mt-4 w-[calc(100vw-2rem)] md:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[60]"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-5 transition-all relative group",
                        !notification.is_read ? "bg-amber-500/5" : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          !notification.is_read ? "bg-amber-500" : "bg-zinc-800"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-white truncate">
                              {notification.title}
                            </h4>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase whitespace-nowrap">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-3">
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                              >
                                View Details
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/30 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
