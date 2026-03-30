import * as React from 'react';
import Image from 'next/image';
import { Search, MessageSquare, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';
import { Conversation } from '@/types';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedChatId: string;
  onSelectChat: (chat: Conversation) => void;
  isMobileListOpen: boolean;
  currentUserId: string;
}

export function ChatSidebar({ 
  conversations, 
  selectedChatId, 
  onSelectChat, 
  isMobileListOpen,
  currentUserId
}: ChatSidebarProps) {
  return (
    <div className={cn(
      "w-full lg:w-96 flex flex-col gap-6 transition-all duration-500",
      !isMobileListOpen && "hidden lg:flex"
    )}>
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Comms Hub</div>
            <h1 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">Messages</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-800">
            <MessageSquare className="w-5 h-5 text-zinc-500" />
          </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search frequencies..."
            className="w-full h-12 bg-zinc-900/50 border border-zinc-800/50 rounded-xl pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {conversations.map((convo) => {
          const isActive = selectedChatId === convo.id;
          const otherPerson = convo.other_person;
          const lastAt = convo.last_message_at ?? convo.created_at;
          const isSeller = currentUserId === convo.seller_id;
          const lastRead = isSeller ? convo.seller_last_read_at : convo.buyer_last_read_at;
          const hasNew = !!convo.last_message_by && 
                         convo.last_message_by !== currentUserId && 
                         (!lastRead || (lastAt && new Date(lastAt) > new Date(lastRead)));

          return (
            <button
              key={convo.id}
              onClick={() => onSelectChat(convo)}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all text-left group flex items-center space-x-4",
                isActive ? "bg-amber-500/10 border-amber-500/50" : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 relative">
                  {otherPerson?.avatar_url ? (
                    <Image src={otherPerson.avatar_url} alt={otherPerson.username || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-zinc-600" />
                  )}
                </div>
                {hasNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-zinc-950 rounded-full" />}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest truncate",
                    isActive ? "text-amber-500" : "text-zinc-100"
                  )}>
                    {otherPerson?.username || 'Unknown User'}
                  </span>
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    {lastAt ? formatDate(lastAt) : ''}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium truncate leading-relaxed">
                  {convo.listing?.title || 'General Chat'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
