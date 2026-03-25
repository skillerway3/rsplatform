'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  List, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  History, 
  Search, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Listings', href: '/admin/listings', icon: List },
  { label: 'Buyer Requests', href: '/admin/requests', icon: MessageSquare },
  { label: 'Support', href: '/admin/support', icon: ShieldCheck },
  { label: 'Disputes', href: '/admin/disputes', icon: AlertCircle },
  { label: 'Verifications', href: '/admin/verifications', icon: UserCheck },
  { label: 'Sellers', href: '/admin/sellers', icon: ShieldCheck },
  { label: 'Audit Logs', href: '/admin/logs', icon: History },
  { label: 'SEO', href: '/admin/seo', icon: Search },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const isAdminEmail = user?.email === 'skillerway100@gmail.com';
  const isAdminRole = profile?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (!isAdminEmail && !isAdminRole)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Access Denied</h1>
        <p className="text-zinc-500 text-sm max-w-md mb-8">
          You do not have the required permissions to access the administration area.
        </p>
        <Link href="/">
          <Button variant="outline" className="rounded-xl px-8">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-zinc-900 border-r border-white/5 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-widest">RS Admin</span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5 text-zinc-950" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-amber-500" : "group-hover:text-white")} />
                {isSidebarOpen && (
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <header className="h-16 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xs font-black text-white uppercase tracking-widest">
              {ADMIN_NAV.find(n => n.href === pathname)?.label || 'Administration'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-zinc-950 rounded-xl border border-white/5">
              <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 text-amber-500" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {profile?.username}
              </span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest">
                Exit Admin
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
