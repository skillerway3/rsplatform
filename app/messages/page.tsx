'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChatSidebar } from '@/components/messages/ChatSidebar';
import { ChatWindow } from '@/components/messages/ChatWindow';
import type { Conversation, Message } from '@/types';
import { toast } from 'sonner';

type ConversationPerson = {
  username: string | null;
  avatar_url: string | null;
};

type ConversationListing = {
  title: string | null;
};

type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string | null;
  last_message_at?: string | null;
  buyer_last_read_at?: string | null;
  seller_last_read_at?: string | null;
  last_message_by?: string | null;
  buyer: ConversationPerson | null;
  seller: ConversationPerson | null;
  listing: ConversationListing | null;
  [key: string]: unknown;
};

type UIConversation = ConversationRow & {
  other_person: ConversationPerson | null;
};

type UIMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean | null;
  [key: string]: unknown;
};

function MessagesPageFallback() {
  return (
    <div className="pt-24 bg-zinc-950 h-screen flex items-center justify-center">
      <div className="text-amber-500 animate-pulse font-black uppercase tracking-widest">
        Loading Frequencies...
      </div>
    </div>
  );
}

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chat');

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<UIConversation[]>([]);
  const [selectedConvo, setSelectedConvo] = React.useState<UIConversation | null>(null);
  const [messages, setMessages] = React.useState<UIMessage[]>([]);
  const [messageText, setMessageText] = React.useState('');
  const [isMobileListOpen, setIsMobileListOpen] = React.useState(!chatId);
  const [loading, setLoading] = React.useState(true);

  const selectedConvoRef = React.useRef<UIConversation | null>(null);
  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  React.useEffect(() => {
    setIsMobileListOpen(!chatId);
  }, [chatId]);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id ?? null);

      if (!data.user) {
        setLoading(false);
      }
    };

    void getCurrentUser();
  }, []);

  const fetchConversations = React.useCallback(
    async (uid: string, isInitial = false) => {
      if (isInitial) setLoading(true);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title),
          buyer:profiles!buyer_id(username, avatar_url),
          seller:profiles!seller_id(username, avatar_url)
        `)
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as ConversationRow[];

      const formatted = rows.map((convo): UIConversation => {
        const buyer = convo.buyer
          ? {
              username: convo.buyer.username ?? null,
              avatar_url: convo.buyer.avatar_url ?? null,
            }
          : null;

        const seller = convo.seller
          ? {
              username: convo.seller.username ?? null,
              avatar_url: convo.seller.avatar_url ?? null,
            }
          : null;

        const listing = convo.listing
          ? {
              title: convo.listing.title ?? null,
            }
          : null;

        return {
          ...convo,
          id: String(convo.id),
          buyer_id: String(convo.buyer_id),
          seller_id: String(convo.seller_id),
          listing_id: convo.listing_id ? String(convo.listing_id) : null,
          last_message_at:
            typeof convo.last_message_at === 'string' ? convo.last_message_at : null,
          buyer_last_read_at:
            typeof convo.buyer_last_read_at === 'string' ? convo.buyer_last_read_at : null,
          seller_last_read_at:
            typeof convo.seller_last_read_at === 'string' ? convo.seller_last_read_at : null,
          last_message_by:
            typeof convo.last_message_by === 'string' ? convo.last_message_by : null,
          buyer,
          seller,
          listing,
          other_person: convo.buyer_id === uid ? seller : buyer,
        };
      });

      setConversations(formatted);

      if (chatId) {
        const found = formatted.find((c) => c.id === String(chatId));
        setSelectedConvo(found ?? null);
      } else {
        setSelectedConvo(null);
      }

      setLoading(false);
    },
    [chatId]
  );

  React.useEffect(() => {
    if (!currentUserId) return;

    void fetchConversations(currentUserId, isFirstLoad.current);
    isFirstLoad.current = false;
  }, [currentUserId, fetchConversations]);

  React.useEffect(() => {
    if (!currentUserId) return;

    const msgChannel = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as UIMessage;

          if (
            selectedConvoRef.current &&
            newMessage.conversation_id === selectedConvoRef.current.id
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }

          void fetchConversations(currentUserId);
        }
      )
      .subscribe();

    const convoChannel = supabase
      .channel('global_conversations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => {
          void fetchConversations(currentUserId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        () => {
          void fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(msgChannel);
      void supabase.removeChannel(convoChannel);
    };
  }, [currentUserId, fetchConversations]);

  React.useEffect(() => {
    if (!selectedConvo) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConvo.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages((data ?? []) as UIMessage[]);
    };

    void fetchMessages();
  }, [selectedConvo]);

  React.useEffect(() => {
    if (!selectedConvo || !currentUserId) return;

    const markAsRead = async () => {
      const isSeller = currentUserId === selectedConvo.seller_id;
      const field = isSeller ? 'seller_last_read_at' : 'buyer_last_read_at';

      const { error } = await supabase
        .from('conversations')
        .update({ [field]: new Date().toISOString() })
        .eq('id', selectedConvo.id);

      if (error) {
        console.error('Error marking as read:', error);
      }
    };

    void markAsRead();
  }, [selectedConvo, currentUserId, messages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConvo || !currentUserId) return;

    const content = messageText.trim();
    setMessageText('');

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConvo.id,
        sender_id: currentUserId,
        content,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
      return;
    }

    const { error: convoError } = await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_by: currentUserId,
      })
      .eq('id', selectedConvo.id);

    if (convoError) {
      console.error('Error updating conversation:', convoError);
    }
  };

  if (loading) {
    return <MessagesPageFallback />;
  }

  if (!currentUserId) {
    return (
      <div className="pt-24 bg-zinc-950 h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase tracking-widest">
          Access Denied. Please Login.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-zinc-950 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 container mx-auto px-6 pb-6 flex gap-6 overflow-hidden">
        <ChatSidebar
          conversations={conversations as unknown as Conversation[]}
          selectedChatId={selectedConvo?.id || ''}
          onSelectChat={(convo: Conversation) => {
            const selected = convo as unknown as UIConversation;
            setSelectedConvo(selected);
            setIsMobileListOpen(false);
            router.push(`/messages?chat=${selected.id}`, { scroll: false });
          }}
          isMobileListOpen={isMobileListOpen}
          currentUserId={currentUserId}
        />

        <ChatWindow
          conversation={selectedConvo as unknown as Conversation | null}
          messages={messages as unknown as Message[]}
          currentUserId={currentUserId}
          isMobileListOpen={isMobileListOpen}
          onBack={() => {
            setIsMobileListOpen(true);
            router.push('/messages', { scroll: false });
          }}
          messageText={messageText}
          onMessageChange={setMessageText}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageFallback />}>
      <MessagesPageContent />
    </Suspense>
  );
}