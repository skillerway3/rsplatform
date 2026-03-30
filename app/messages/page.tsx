'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChatSidebar } from '@/components/messages/ChatSidebar';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { Conversation, Message } from '@/types';
import { toast } from 'sonner';

export default function MessagesPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </React.Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chat');

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [messageText, setMessageText] = React.useState('');
  const [isMobileListOpen, setIsMobileListOpen] = React.useState(!chatId);
  const [loading, setLoading] = React.useState(true);

  // Use a ref for the selected conversation to avoid stale closures in subscriptions
  const selectedConvoRef = React.useRef<Conversation | null>(null);
  React.useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  // 1. Get current user
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
      if (!data.user) setLoading(false);
    });
  }, []);

  // 2. Fetch conversations
  const fetchConversations = React.useCallback(async (uid: string, isInitial = false) => {
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

    const formatted = (data as (Conversation & { 
      buyer: { username: string; avatar_url: string | null }; 
      seller: { username: string; avatar_url: string | null }; 
      listing: { title: string } 
    })[]).map(convo => ({
      ...convo,
      other_person: convo.buyer_id === uid ? convo.seller : convo.buyer
    }));

    setConversations(formatted);
    
    // If there's a chatId in URL, select it
    if (chatId) {
      const found = formatted.find(c => c.id === chatId);
      if (found) setSelectedConvo(found);
    }

    setLoading(false);
  }, [chatId]);

  const isFirstLoad = React.useRef(true);
  React.useEffect(() => {
    if (currentUserId) {
      fetchConversations(currentUserId, isFirstLoad.current);
      isFirstLoad.current = false;
    }
  }, [currentUserId, fetchConversations]);

  // 3. Global Realtime Subscriptions
  React.useEffect(() => {
    if (!currentUserId) return;

    // Listen for ALL message inserts to update sidebar and current chat
    const msgChannel = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Update chat window if it's the active conversation
          if (selectedConvoRef.current && newMessage.conversation_id === selectedConvoRef.current.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
          
          // Refresh conversations to update sidebar (unread indicators, last message)
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    // Listen for conversation updates (last_read_at, last_message_at)
    const convoChannel = supabase
      .channel('global_conversations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations(currentUserId);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(convoChannel);
    };
  }, [currentUserId, fetchConversations]);

  // 4. Fetch messages for selected conversation
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

      setMessages(data as Message[]);
    };

    fetchMessages();
  }, [selectedConvo]);

  // 5. Mark as read logic
  React.useEffect(() => {
    if (!selectedConvo || !currentUserId) return;

    const markAsRead = async () => {
      const isSeller = currentUserId === selectedConvo.seller_id;
      const field = isSeller ? 'seller_last_read_at' : 'buyer_last_read_at';
      
      const { error } = await supabase
        .from('conversations')
        .update({ [field]: new Date().toISOString() })
        .eq('id', selectedConvo.id);

      if (error) console.error('Error marking as read:', error);
    };

    markAsRead();
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
        content
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
      return;
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_by: currentUserId
      })
      .eq('id', selectedConvo.id);
  };

  if (loading) {
    return (
      <div className="pt-24 bg-zinc-950 h-screen flex items-center justify-center">
        <div className="text-amber-500 animate-pulse font-black uppercase tracking-widest">Loading Frequencies...</div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="pt-24 bg-zinc-950 h-screen flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase tracking-widest">Access Denied. Please Login.</div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-zinc-950 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 container mx-auto px-6 pb-6 flex gap-6 overflow-hidden">
        <ChatSidebar 
          conversations={conversations}
          selectedChatId={selectedConvo?.id || ''}
          onSelectChat={(convo) => {
            setSelectedConvo(convo);
            setIsMobileListOpen(false);
            router.push(`/messages?chat=${convo.id}`, { scroll: false });
          }}
          isMobileListOpen={isMobileListOpen}
          currentUserId={currentUserId}
        />

        <ChatWindow 
          conversation={selectedConvo}
          messages={messages}
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
