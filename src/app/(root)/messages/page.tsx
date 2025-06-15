"use client";

import { useState } from "react";
import { MessengerLayout } from "@/components/instagram/messenger-layout";
import { Conversation } from "@/lib/instagram-client";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="flex flex-col h-full">
      <MessengerLayout 
        onSelectConversation={setSelectedConversation}
        selectedConversation={selectedConversation}
      />
    </div>
  );
} 