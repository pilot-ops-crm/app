"use client";

import { useState, useCallback, useEffect } from "react";
import { useIGAuth } from "./use-ig-auth";
import { 
  Message, 
  Conversation, 
  fetchConversations as fetchConversationsApi,
  fetchThreadMessages as fetchThreadMessagesApi,
  sendInstagramMessage 
} from "@/lib/instagram-client";

interface SendMessageParams {
  threadId: string;
  text?: string;
  mediaId?: string;
}

export function useIGMessages() {
  const { isAuthenticated } = useIGAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const conversationsData = await fetchConversationsApi();
      setConversations(conversationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getThreadMessages = useCallback(async (threadId: string) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const messagesData = await fetchThreadMessagesApi(threadId);
      setMessages(messagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const sendMessage = useCallback(async ({ threadId, text, mediaId }: SendMessageParams) => {
    if (!isAuthenticated) return;

    try {
      const newMessage = await sendInstagramMessage({ threadId, text, mediaId });
      
      // Update local messages state with the new message
      setMessages(prev => [newMessage, ...prev]);
      
      return newMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error(err);
      throw err;
    }
  }, [isAuthenticated]);

  // Fetch conversations on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    getThreadMessages,
    sendMessage,
  };
} 