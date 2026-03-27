'use client';

import * as React from 'react';
import { MESSAGES, USERS } from '@/data/mock';
import { ChatSidebar } from '@/components/messages/ChatSidebar';
import { ChatWindow } from '@/components/messages/ChatWindow';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = React.useState(MESSAGES[0]);
  const [messageText, setMessageText] = React.useState('');
  const [isMobileListOpen, setIsMobileListOpen] = React.useState(true);

  const activeUser = USERS.find(u => u.id === selectedChat.senderId) || USERS[0];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  return (
    <div className="pt-24 bg-zinc-950 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 container mx-auto px-6 pb-6 flex gap-6 overflow-hidden">
        <ChatSidebar 
          chats={MESSAGES}
          users={USERS}
          selectedChatId={selectedChat.id}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setIsMobileListOpen(false);
          }}
          isMobileListOpen={isMobileListOpen}
        />

        <ChatWindow 
          activeUser={activeUser}
          isMobileListOpen={isMobileListOpen}
          onBack={() => setIsMobileListOpen(true)}
          messageText={messageText}
          onMessageChange={setMessageText}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
