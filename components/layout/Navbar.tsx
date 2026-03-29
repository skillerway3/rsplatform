'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, MessageSquare, User, Menu, X, PlusCircle, ChevronDown, LogOut, LayoutDashboard, Zap, BadgeCheck, DollarSign, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_SECTIONS } from '@/data/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import Image from 'next/image';

export function Navbar() {
  const { user, profile, signOut, isVerifiedSeller } = useAuth();
  useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [activeMobileAccordion, setActiveMobileAccordion] = React.useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as HTMLElement).closest('.nav-dropdown-container')) {
        setActiveDropdown(null);
      }
      if (isProfileOpen && !(event.target as HTMLElement).closest('.profile-dropdown-container')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown, isProfileOpen]);

  const handleNavClick = (sectionId: string, gameId: string) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    router.push(`/browse?section=${sectionId}&game=${gameId.toLowerCase()}`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6',
        isScrolled ? 'bg-zinc-950 border-b border-white/5 py-4' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-500">
            <ShieldCheck className="text-zinc-950 w-6 h-6" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter text-white uppercase">
            RS<span className="text-amber-500">PLATFORM</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-10">
          {NAV_SECTIONS.map((section) => {
            const isActive = searchParams.get('section') === section.id;
            return (
              <div key={section.id} className="relative nav-dropdown-container">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === section.id ? null : section.id)}
                  className={cn(
                    'flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 py-2 group',
                    activeDropdown === section.id || isActive ? 'text-amber-500' : 'text-zinc-100 hover:text-amber-500'
                  )}
                >
                  <span className="relative">
                    {section.name}
                    <span className={cn(
                      "absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 transition-all duration-300",
                      (activeDropdown === section.id || isActive) && "w-full"
                    )} />
                  </span>
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-500 ease-out",
                    activeDropdown === section.id ? "rotate-180 text-amber-500" : "text-zinc-400 group-hover:text-amber-500"
                  )} />
                </button>

                <AnimatePresence>
                  {activeDropdown === section.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-3 z-[60]"
                    >
                      <div className="px-4 py-2 mb-2 border-b border-white/5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Select Game</span>
                      </div>
                      {section.games.map((game) => {
                        const isGameActive = searchParams.get('game') === game.id.toLowerCase() && isActive;
                        return (
                          <button
                            key={game.id}
                            onClick={() => handleNavClick(section.id, game.id)}
                            className={cn(
                              "w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-between group/item",
                              isGameActive ? "text-amber-500 bg-amber-500/5" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <span>{game.name}</span>
                            <div className={cn(
                              "w-1 h-1 rounded-full transition-all duration-300",
                              isGameActive ? "bg-amber-500 scale-125 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-transparent group-hover/item:bg-zinc-700"
                            )} />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <Link
            href="/support"
            className={cn(
              'text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 py-2 relative group',
              pathname === '/support' ? 'text-amber-500' : 'text-zinc-100 hover:text-amber-500'
            )}
          >
            <span>Contact Us</span>
            <span className={cn(
              "absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-500 transition-all duration-300 group-hover:w-full",
              pathname === '/support' && "w-full"
            )} />
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Link href="/messages" className="p-2 text-zinc-100 hover:text-amber-500 transition-colors relative">
              <MessageSquare className="w-5 h-5" />
            </Link>
            
            <NotificationDropdown />
            
            <div className="relative profile-dropdown-container">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={cn(
                  "p-1 transition-colors rounded-xl border border-transparent",
                  isProfileOpen ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-zinc-100 hover:text-amber-500"
                )}
              >
                {profile?.avatar_url ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 relative">
                    <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-4 w-64 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-3 z-[60]"
                  >
                    {user ? (
                      <>
                        <div className="px-5 py-4 border-b border-white/5 mb-2 bg-white/5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0 relative">
                              {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-zinc-600" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-white uppercase tracking-widest truncate leading-none mb-1">
                                {profile?.username || 'Member'}
                              </p>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] truncate">
                                {profile?.role === 'admin' ? 'Administrator' : 'Member'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {isVerifiedSeller && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                              </div>
                            )}
                            {profile?.is_trusted_seller && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                <BadgeCheck className="w-2.5 h-2.5 text-amber-500" />
                                <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Trusted</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/orders"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/dashboard/my-listings"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <PlusCircle className="w-4 h-4" />
                          My Listings
                        </Link>
                        <Link
                          href="/dashboard/sales"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <DollarSign className="w-4 h-4" />
                          My Sales
                        </Link>
                        <Link
                          href="/dashboard/offers"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Zap className="w-4 h-4" />
                          My Offers
                        </Link>
                        {profile?.role === 'admin' && (
                          <>
                            <Link
                              href="/admin/verifications"
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/5 transition-all"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Admin Verifications
                            </Link>
                            <Link
                              href="/admin/sellers"
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/5 transition-all"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Admin Sellers
                            </Link>
                          </>
                        )}
                        <button
                          onClick={async () => {
                            console.log('[Navbar] Logout clicked');
                            setIsProfileOpen(false);
                            await signOut();
                            console.log('[Navbar] Sign out complete, redirecting...');
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-5 py-3 border-b border-white/5 mb-2">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Account</p>
                        </div>
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <PlusCircle className="w-4 h-4" />
                          Sign Up
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <Link href="/sell">
            <Button variant="gold" size="sm" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] h-11">
              <PlusCircle className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </Link>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center space-x-2">
          {user ? (
            <>
              <Link href="/messages" className="p-2 text-zinc-100 hover:text-amber-500 transition-colors relative">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <NotificationDropdown />
            </>
          ) : (
            <Link href="/login" className="p-2 text-zinc-100 hover:text-amber-500 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          )}
          
          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-10 flex flex-col space-y-4">
              {NAV_SECTIONS.map((section) => {
                const isActive = searchParams.get('section') === section.id;
                return (
                  <div key={section.id} className="flex flex-col border-b border-white/5 last:border-0 pb-2">
                    <button
                      onClick={() => setActiveMobileAccordion(activeMobileAccordion === section.id ? null : section.id)}
                      className={cn(
                        "flex items-center justify-between w-full text-lg font-black uppercase tracking-widest py-4 transition-colors",
                        activeMobileAccordion === section.id || isActive ? "text-amber-500" : "text-zinc-100"
                      )}
                    >
                      <span>{section.name}</span>
                      <ChevronDown className={cn("w-5 h-5 transition-transform duration-500", activeMobileAccordion === section.id && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {activeMobileAccordion === section.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col space-y-1 pl-4 mb-4 overflow-hidden"
                        >
                          {section.games.map((game) => {
                            const isGameActive = searchParams.get('game') === game.id.toLowerCase() && isActive;
                            return (
                              <button
                                key={game.id}
                                onClick={() => handleNavClick(section.id, game.id)}
                                className={cn(
                                  "text-left py-3 text-sm font-black uppercase tracking-widest transition-colors flex items-center space-x-3",
                                  isGameActive ? "text-amber-500" : "text-zinc-500"
                                )}
                              >
                                <div className={cn(
                                  "w-1.5 h-[1px] transition-all",
                                  isGameActive ? "w-4 bg-amber-500" : "bg-zinc-800"
                                )} />
                                <span>{game.name}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              
              <Link
                href="/support"
                className={cn(
                  "text-lg font-black uppercase tracking-widest py-4 border-b border-white/5",
                  pathname === '/support' ? "text-amber-500" : "text-zinc-100"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Support
              </Link>

              <div className="pt-8 flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/dashboard/orders" 
                    className="flex items-center justify-center py-4 bg-zinc-900 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] border border-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    href="/dashboard/sales" 
                    className="flex items-center justify-center py-4 bg-zinc-900 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] border border-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Sales
                  </Link>
                  <Link 
                    href="/messages" 
                    className="flex items-center justify-center py-4 bg-zinc-900 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] border border-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center justify-center py-4 bg-zinc-900 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] border border-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </div>
                <div className="flex gap-4">
                  <Link href="/sell" className="flex-1">
                    <Button variant="gold" className="w-full py-7 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/10">
                      List Item
                    </Button>
                  </Link>
                  <button 
                    onClick={async () => {
                      await signOut();
                      setIsMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
