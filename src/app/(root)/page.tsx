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
import {
  Send,
  Menu,
  Image as ImageIcon,
  Video,
  Sticker,
  Instagram,
  Heart,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
  reactToMessage,
  removeReaction,
} from "@/actions/instagram/chats";

import { Chat, Message } from "@/types";
import Link from "next/link";
import {
  getMessageContent,
  createOptimisticMessage,
  updateMessagesAfterSend,
} from "@/components/messages/helpers";

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
  const [mediaType, setMediaType] = useState<
    "image" | "video" | "sticker" | "post"
  >("image");
  const [reactingToMessage, setReactingToMessage] = useState<string | null>(
    null
  );

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

    const tempMessage = createOptimisticMessage(
      mediaUrl,
      mediaType,
      currentUser
    );

    setMessages((prev) => [...prev, tempMessage]);

    setMediaUrl("");
    setShowMediaInput(false);

    const sendFunctions = {
      image: sendImageMessage,
      video: sendVideoMessage,
      sticker: sendStickerMessage,
      post: sendInstagramPost,
    };

    try {
      const sendFunction =
        sendFunctions[mediaType as keyof typeof sendFunctions];
      if (!sendFunction) {
        throw new Error(`Unsupported media type: ${mediaType}`);
      }

      const result = await sendFunction(selectedChat, mediaUrl);

      const updateResult = updateMessagesAfterSend(
        result,
        tempMessage,
        mediaType,
        mediaUrl,
        currentUser,
        setMessages,
        setChats,
        selectedChat
      );

      if (updateResult && "error" in updateResult) {
        toast.error(updateResult.error);
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

  const renderReactions = (message: Message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <div className="flex items-center text-xs mt-1">
        <div className="bg-foreground/5 rounded-full px-2 py-1 flex items-center">
          <Heart className="h-3 w-3 text-red-500 mr-1" fill="currentColor" />
          <span>{message.reactions.length}</span>
        </div>
      </div>
    );
  };

  const handleReaction = async (messageId: string) => {
    if (!selectedChat) return;

    setReactingToMessage(messageId);

    try {
      const message = messages.find((msg) => msg.id === messageId);
      const hasReacted = message?.reactions?.some(
        (r) => r.sender === currentUser
      );

      if (hasReacted) {
        const result = await removeReaction(selectedChat, messageId);
        console.log("Remove reaction result:", result);

        if (result.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: (msg.reactions || []).filter(
                      (r) => r.sender !== currentUser
                    ),
                  }
                : msg
            )
          );
          toast.success("Reaction removed");
        } else if ("error" in result) {
          if (result.errorCode === "MESSAGE_TOO_OLD") {
            toast.error("Instagram only allows reactions to recent messages", {
              description: "This limitation is imposed by Instagram's API",
            });
          } else {
            toast.error(result.error);
          }
        }
      } else {
        const result = await reactToMessage(selectedChat, messageId, "love");
        console.log("Add reaction result:", result);

        if (result.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: [
                      ...(msg.reactions || []),
                      { type: "love", sender: currentUser },
                    ],
                  }
                : msg
            )
          );
          toast.success("Reaction added");
        } else if ("error" in result) {
          if (result.errorCode === "MESSAGE_TOO_OLD") {
            toast.error("Instagram only allows reactions to recent messages", {
              description: "This limitation is imposed by Instagram's API",
            });
          } else {
            toast.error(result.error);
          }
        }
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Failed to handle reaction");
    } finally {
      setReactingToMessage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chats...</p>
      </div>
    );
  }

  console.log(chats)

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
            <div className="flex items-center gap-2 justify-between w-full">
              <h1 className="text-xl font-semibold">
                {chats.find((chat) => chat.id === selectedChat)?.username}
              </h1>
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={`https://www.instagram.com/${
                    chats.find((chat) => chat.id === selectedChat)?.username
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </Button>{" "}
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <ChatMessageList>
              {messages.map((message, i) => (
                <ChatBubble
                  key={`${message.id}-${i}`}
                  variant={isCurrentUser(message.sender) ? "sent" : "received"}
                  className={`group ${
                    isCurrentUser(message.sender) ? "max-w-[85%]" : ""
                  }`}
                >
                  <ChatBubbleAvatar
                    fallback={
                      message.sender && message.sender[0]
                        ? message.sender[0].toUpperCase()
                        : "U"
                    }
                    // src={chats.find((c) => c.id === selectedChat)?.avatar}
                  />
                  <div className="flex flex-col">
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
                    {renderReactions(message)}
                  </div>
                  <div
                    className={`flex flex-col ${
                      isCurrentUser(message.sender)
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <button
                      onClick={() => handleReaction(message.id)}
                      disabled={reactingToMessage === message.id}
                      className={`rounded-full hover:text-foreground/80 ${
                        message.reactions?.some((r) => r.sender === currentUser)
                          ? "text-red-500"
                          : "text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      }`}
                      title="React with heart"
                    >
                      {reactingToMessage === message.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart
                          className="h-4 w-4"
                          fill={
                            message.reactions?.some(
                              (r) => r.sender === currentUser
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )}
                    </button>
                    <ChatBubbleTimestamp
                      timestamp={new Date(message.timestamp).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    />
                  </div>
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
                <Button onClick={handleSendMedia} size="sm">
                  Send
                </Button>
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
