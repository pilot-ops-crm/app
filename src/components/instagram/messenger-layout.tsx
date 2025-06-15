"use client";

import { useState } from "react";
import { ConversationsList } from "./conversations-list";
import { ChatArea } from "./chat-area";
import { LoginForm } from "./login-form";
import { useIGAuth } from "@/hooks/use-ig-auth";
import { Conversation } from "@/lib/instagram-client";

interface MessengerLayoutProps {
  onSelectConversation?: (conversation: Conversation) => void;
  selectedConversation?: Conversation | null;
}

export function MessengerLayout({
  onSelectConversation,
  selectedConversation: externalSelectedConversation,
}: MessengerLayoutProps) {
  const [internalSelectedConversation, setInternalSelectedConversation] = useState<Conversation | null>(null);
  const { isAuthenticated } = useIGAuth();

  // Use either the external state (if provided) or the internal state
  const selectedConversation = externalSelectedConversation !== undefined 
    ? externalSelectedConversation 
    : internalSelectedConversation;

  const handleSelectConversation = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
    } else {
      setInternalSelectedConversation(conversation);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-md overflow-hidden">
      <div className="w-1/3 border-r">
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.thread_id}
        />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatArea conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
} 