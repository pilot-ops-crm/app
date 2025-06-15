"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIGMessages } from "@/hooks/use-ig-messages";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/lib/instagram-client";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string | undefined;
}

export function ConversationsList({
  onSelectConversation,
  selectedConversationId,
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { conversations, loading, error } = useIGMessages();
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (conversations) {
      setFilteredConversations(
        conversations.filter((convo) =>
          convo.users.some((user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }
  }, [conversations, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            disabled
          />
        </div>
        <div className="flex-1 p-4 text-center text-muted-foreground">
          Loading conversations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 p-4 text-center text-red-500">
          Failed to load conversations
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const lastMessage = conversation.items?.[0];
            const isSelected = conversation.thread_id === selectedConversationId;
            const participant = conversation.users?.[0];

            return (
              <div
                key={conversation.thread_id}
                className={`p-4 cursor-pointer hover:bg-accent/50 ${
                  isSelected ? "bg-accent" : ""
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {participant?.profile_pic_url ? (
                      <AvatarImage src={participant.profile_pic_url} alt={participant.username} />
                    ) : (
                      <AvatarFallback>
                        {participant?.username?.substring(0, 2).toUpperCase() || "UN"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">
                        {participant?.username || "Unknown"}
                      </span>
                      {lastMessage?.timestamp && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(lastMessage.timestamp), {
                            addSuffix: false,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {lastMessage?.text || "No messages yet"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
} 