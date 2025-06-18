"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Send, Menu } from "lucide-react";
import { toast } from "sonner";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";

import {
  fetchInstagramChats,
  fetchChatMessages,
  sendChatMessage,
  getCurrentUser,
} from "@/actions/instagram/chats";
import { Chat, InstagramMessage } from "@/types";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<InstagramMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const result = await fetchInstagramChats();

        if (Array.isArray(result)) {
          setChats(result);
        } else if ("error" in result && result.error) {
          toast.warning(result.error);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load chats");
      } finally {
        setIsLoading(false);
      }
    };

    const loadCurrentUser = async () => {
      try {
        const result = await getCurrentUser();

        if ("username" in result && result.username) {
          setCurrentUser(result.username);
        } else if ("error" in result && result.error) {
          toast.warning(result.error);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchChats();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        try {
          const result = await fetchChatMessages(selectedChat);

          if (Array.isArray(result)) {
            const sortedMessages = [...result].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            setMessages(sortedMessages);
          } else if ("error" in result && result.error) {
            toast.warning(result.error);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to load messages");
        }
      };

      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const tempMessage: InstagramMessage = {
      id: `temp-${Date.now()}`,
      text: newMessage,
      sender: currentUser,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const result = await sendChatMessage(selectedChat, newMessage);

      if ("id" in result && result.id) {
        const serverMessage: InstagramMessage = {
          id: result.id,
          text: result.text || newMessage,
          sender: currentUser,
          timestamp: result.timestamp || new Date().toISOString(),
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? serverMessage : msg))
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat
              ? { ...chat, lastMessage: newMessage.substring(0, 30) }
              : chat
          )
        );
      } else if ("error" in result && result.error) {
        toast.error(result.error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === currentUser;
  };

  const getMessageContent = (message: InstagramMessage) => {
    if (message.text) {
      return message.text;
    }

    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      switch (attachment.type) {
        case "image":
          return (
            <Image
              src={attachment.payload.url}
              alt="Image"
              width={200}
              height={200}
              className="rounded-lg object-cover max-w-[250px]"
            />
          );
        case "video":
          return (
            <video
              src={attachment.payload.url}
              controls
              className="rounded-lg max-w-[250px]"
            />
          );
        case "audio":
          return (
            <audio
              src={attachment.payload.url}
              controls
              className="rounded-lg max-w-[250px]"
            />
          );
        default:
          return (
            <a
              href={attachment.payload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              [Attachment]
            </a>
          );
      }
    }

    return "[Message content unavailable]";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="block w-80 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <ScrollArea>
          {chats.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b cursor-pointer hover:bg-foreground/20 ${
                  selectedChat === chat.id ? "bg-foreground/10" : ""
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center relative">
                    <span className="text-lg font-semibold text-foreground">
                      {chat.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{chat.username}</p>
                    <p className="text-sm text-neutral-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {!selectedChat ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Select a Chat</CardTitle>
              <CardDescription>
                Choose a conversation from the list to start messaging
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <header className="h-[60px] border-b flex items-center justify-between px-6">
            <div className="md:hidden">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setSelectedChat(null)}
              >
                <Menu className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-primary">
              {chats.find((chat) => chat.id === selectedChat)?.username}
            </h1>
          </header>

          <div className="flex-1 overflow-hidden">
            <ChatMessageList>
              {messages.map((message, i) => (
                <ChatBubble
                  key={`${message.id}-${i}`}
                  variant={isCurrentUser(message.sender) ? "sent" : "received"}
                  className={isCurrentUser(message.sender) ? "max-w-[85%]" : ""}
                >
                  <ChatBubbleAvatar
                    fallback={
                      message.sender && message.sender[0]
                        ? message.sender[0].toUpperCase()
                        : "U"
                    }
                  />
                  <ChatBubbleMessage
                    variant={
                      isCurrentUser(message.sender) ? "sent" : "received"
                    }
                    className={
                      isCurrentUser(message.sender)
                        ? "bg-primary text-primary-foreground rounded-[20px] rounded-tr-none"
                        : "bg-secondary text-secondary-foreground rounded-[20px] rounded-tl-none"
                    }
                  >
                    {getMessageContent(message)}
                  </ChatBubbleMessage>
                  <ChatBubbleTimestamp
                    timestamp={new Date(message.timestamp).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  />
                </ChatBubble>
              ))}
              <div ref={messageEndRef} />
            </ChatMessageList>
          </div>

          <div className="p-4 border-t bg-background">
            <div className="relative border rounded-2xl">
              <ChatInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send your message..."
                className="bg-card border-0 shadow-none pr-12 rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                type="button"
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}