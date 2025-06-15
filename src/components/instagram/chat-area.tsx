"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Smile, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIGMessages } from "@/hooks/use-ig-messages";
import { formatRelative } from "date-fns";
import { Conversation, Message } from "@/lib/instagram-client";

interface ChatAreaProps {
  conversation: Conversation | null;
}

export function ChatArea({ conversation }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, getThreadMessages, messages, loading } = useIGMessages();
  
  useEffect(() => {
    if (conversation?.thread_id) {
      getThreadMessages(conversation.thread_id);
    }
  }, [conversation, getThreadMessages]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSubmitting || !conversation) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage({
        threadId: conversation.thread_id,
        text: message,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start messaging
      </div>
    );
  }

  const participant = conversation.users?.[0];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b flex items-center">
        <Avatar>
          {participant?.profile_pic_url ? (
            <AvatarImage src={participant.profile_pic_url} alt={participant.username} />
          ) : (
            <AvatarFallback>
              {participant?.username?.substring(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">{participant?.username || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">
            {participant?.full_name || ""}
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center p-4 text-muted-foreground">
            Loading messages...
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg: Message) => {
              const isOwnMessage = msg.user_id === "currentUser"; // This should be updated based on API
              
              return (
                <div
                  key={msg.item_id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.media && (
                      <div className="mb-2">
                        <img
                          src={msg.media.url}
                          alt="Media"
                          className="rounded max-w-full"
                        />
                      </div>
                    )}
                    
                    {msg.text && <div>{msg.text}</div>}
                    
                    <div className="text-xs mt-1 opacity-70">
                      {formatRelative(new Date(msg.timestamp), new Date())}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        ) : (
          <div className="flex justify-center p-4 text-muted-foreground">
            No messages yet
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
} 