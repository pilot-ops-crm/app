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
import { Send, Menu, Image as ImageIcon, Video, Sticker, Instagram } from "lucide-react";
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
  sendImageMessage,
  sendVideoMessage,
  sendStickerMessage,
  sendInstagramPost,
} from "@/actions/instagram/chats";

import { Chat, Message } from "@/types";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "sticker" | "post">("image");

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

    const tempMessage: Message = {
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
        const serverMessage: Message = {
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

  const handleSendMedia = async () => {
    if (!mediaUrl.trim() || !selectedChat) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      attachments: [
        {
          type: mediaType,
          payload: { 
            url: mediaUrl,
            title: mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
          }
        }
      ]
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMediaUrl("");
    setShowMediaInput(false);

    try {
      let result;
      switch (mediaType) {
        case "image":
          result = await sendImageMessage(selectedChat, mediaUrl);
          break;
        case "video":
          result = await sendVideoMessage(selectedChat, mediaUrl);
          break;
        case "sticker":
          result = await sendStickerMessage(selectedChat, mediaUrl);
          break;
        case "post":
          result = await sendInstagramPost(selectedChat, mediaUrl);
          break;
      }

      if (result && "id" in result) {
        const serverMessage: Message = {
          id: result.id,
          sender: currentUser,
          timestamp: result.timestamp || new Date().toISOString(),
          attachments: result.attachments || [
            {
              type: mediaType,
              payload: { 
                url: mediaUrl,
                title: mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
              }
            }
          ]
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? serverMessage : msg))
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat
              ? { ...chat, lastMessage: `[${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}]` }
              : chat
          )
        );
      } else if (result && "error" in result) {
        toast.error(result.error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      }
    } catch (error) {
      console.error(`Error sending ${mediaType}:`, error);
      toast.error(`Error sending ${mediaType}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === currentUser;
  };

  const getMessageContent = (message: Message) => {
    if (message.text) {
      return message.text;
    }

    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      
      if (!attachment.payload.url) {
        console.warn("Missing URL for attachment:", attachment);
        return `[${attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)}]`;
      }
      
      switch (attachment.type) {
        case "image":
          return (
            <div className="relative">
              <Image
                src={attachment.payload.url}
                alt={attachment.payload.title || "Image"}
                width={300}
                height={300}
                className="rounded-lg object-contain max-w-[300px]"
                onError={(e) => {
                  console.error("Image failed to load:", attachment.payload.url);
                  (e.target as HTMLImageElement).src = "/file.svg";
                  (e.target as HTMLImageElement).className = "w-8 h-8";
                }}
              />
            </div>
          );
        case "video":
          return (
            <div className="relative">
              <video
                src={attachment.payload.url}
                controls
                className="rounded-lg max-w-[250px]"
                onError={(e) => {
                  console.error("Video failed to load:", attachment.payload.url);
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="flex items-center gap-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> Video</div>`;
                  }
                }}
              />
            </div>
          );
        case "audio":
          return (
            <audio
              src={attachment.payload.url}
              controls
              className="rounded-lg max-w-[250px]"
              onError={(e) => {
                console.error("Audio failed to load:", attachment.payload.url);
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="flex items-center gap-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg> Audio</div>`;
                }
              }}
            />
          );
        case "sticker":
          return (
            <div className="relative">
              <Image
                src={attachment.payload.url}
                alt={attachment.payload.title || "Sticker"}
                width={150}
                height={150}
                className="object-contain"
                onError={(e) => {
                  console.error("Sticker failed to load:", attachment.payload.url);
                  (e.target as HTMLImageElement).src = "/file.svg";
                  (e.target as HTMLImageElement).className = "w-8 h-8";
                }}
              />
            </div>
          );
        case "story":
          return (
            <div className="flex flex-col items-center">
              <div className="mb-1 text-sm text-neutral-500">Instagram Story</div>
              <Image
                src={attachment.payload.url}
                alt={attachment.payload.title || "Story"}
                width={200}
                height={200}
                className="rounded-lg object-cover max-w-[250px]"
                onError={(e) => {
                  console.error("Story image failed to load:", attachment.payload.url);
                  (e.target as HTMLImageElement).src = "/file.svg";
                  (e.target as HTMLImageElement).className = "w-8 h-8";
                }}
              />
            </div>
          );
        case "post":
          return (
            <a
              href={attachment.payload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              {attachment.payload.title || "Instagram Post"}
            </a>
          );
        case "template":
          return (
            <a
              href={attachment.payload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              {attachment.payload.title || "Instagram Content"}
            </a>
          );
        default:
          return (
            <a
              href={attachment.payload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline flex items-center gap-2"
            >
              <Image
                src="/file.svg"
                alt="File"
                width={16}
                height={16}
                className="mr-1"
              />
              {attachment.payload.title || attachment.type || "Attachment"}
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
      <div className="hidden md:block w-80 border-r">
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
                    // src={chats.find((c) => c.id === selectedChat)?.avatar}
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
            {showMediaInput && (
              <div className="mb-2 flex space-x-2">
                <div className="flex-1 relative border rounded-lg">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={`Enter ${mediaType} URL or ID...`}
                    className="w-full p-2 bg-card border-0 rounded-lg"
                  />
                </div>
                <Button onClick={handleSendMedia} size="sm">Send</Button>
                <Button 
                  onClick={() => setShowMediaInput(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
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
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex space-x-1">
                <button
                  onClick={() => {
                    setMediaType("image");
                    setShowMediaInput(true);
                  }}
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Send image"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setMediaType("video");
                    setShowMediaInput(true);
                  }}
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Send video"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setMediaType("sticker");
                    setShowMediaInput(true);
                  }}
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Send sticker"
                >
                  <Sticker className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setMediaType("post");
                    setShowMediaInput(true);
                  }}
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Send Instagram post"
                >
                  <Instagram className="h-4 w-4" />
                </button>
              </div>
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