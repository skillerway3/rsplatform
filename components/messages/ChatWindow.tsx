import * as React from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  MoreVertical,
  ChevronLeft,
  User as UserIcon,
  Lock,
  Plus,
  Image as ImageIcon,
  Smile,
  Send,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Message, Conversation } from '@/types';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  isMobileListOpen: boolean;
  onBack: () => void;
  messageText: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  isMobileListOpen,
  onBack,
  messageText,
  onMessageChange,
  onSendMessage,
}: ChatWindowProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div
        className={cn(
          'flex-1 flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden transition-all duration-500',
          isMobileListOpen && 'hidden lg:flex'
        )}
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5 mx-auto">
            <MessageSquare className="w-10 h-10 text-zinc-700" />
          </div>
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">
            Select a frequency
          </h3>
          <p className="text-[10px] text-zinc-700 font-medium uppercase tracking-widest">
            Choose a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherPerson = conversation.other_person;

  return (
    <div
      className={cn(
        'flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden transition-all duration-500',
        isMobileListOpen && 'hidden lg:flex'
      )}
    >
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={onBack}
          >
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </Button>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden relative">
              {otherPerson?.avatar_url ? (
                <Image
                  src={otherPerson.avatar_url}
                  alt={otherPerson.username || 'User avatar'}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-zinc-600" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">
                  {otherPerson?.username || 'Unknown User'}
                </h3>
              </div>
              <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-800">
            <ShieldCheck className="w-5 h-5 text-zinc-500" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-800">
            <MoreVertical className="w-5 h-5 text-zinc-500" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5">
            <Lock className="w-8 h-8 text-zinc-700" />
          </div>
          <div className="text-center">
            <h4 className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.3em] mb-2">
              End-to-End Encrypted
            </h4>
            <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">
              Messages are secured by end-to-end encryption
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {messages.map((m) => {
            const senderId = m.sender_id ?? m.senderId ?? '';
            const createdAt = m.created_at ?? m.createdAt ?? null;
            const isMine = senderId === currentUserId;

            return (
              <div
                key={m.id}
                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[70%] space-y-2',
                    isMine ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'p-4 rounded-2xl',
                      isMine
                        ? 'bg-amber-500 text-zinc-950 rounded-tr-none shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-800/50 border border-white/5 text-zinc-300 rounded-tl-none'
                    )}
                  >
                    <p className={cn('text-sm leading-relaxed', isMine ? 'font-medium' : '')}>
                      {m.content}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'flex items-center space-x-2 px-1',
                      isMine ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                      {createdAt
                        ? new Date(createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'No Time'}
                    </span>
                    {isMine && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="p-6 bg-zinc-900/50 border-t border-white/5">
        <div className="flex items-end space-x-4">
          <div className="flex space-x-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border border-zinc-800 h-10 w-10"
            >
              <Plus className="w-4 h-4 text-zinc-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border border-zinc-800 h-10 w-10"
            >
              <ImageIcon className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <textarea
              rows={1}
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              className="w-full bg-black/40 border border-zinc-800/50 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700 resize-none max-h-40 custom-scrollbar"
            />
            <div className="absolute right-4 bottom-4 flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <Smile className="w-4 h-4 text-zinc-600" />
              </Button>
            </div>
          </div>

          <Button
            variant="gold"
            size="icon"
            onClick={onSendMessage}
            disabled={!messageText.trim()}
            className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-amber-500/20 mb-1"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}