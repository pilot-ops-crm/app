'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { InstagramConversation, InstagramMessage, Message } from "@/types";

/**
 * Fetch Instagram chats
 */
export async function fetchInstagramChats() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/conversations?fields=participants,updated_time,unread_count,messages{id,from,message,created_time,attachments}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken?.value}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to fetch conversations: ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json();
    console.log("data", data[0].participants);
    
    if (!data || data.length === 0) {
      return [];
    }

    const chats = data.map((conversation: InstagramConversation) => {
      let lastMessage = "No messages yet";
      if (conversation.messages && conversation.messages.data && conversation.messages.data.length > 0) {
        const lastMsg = conversation.messages.data[0];
        
        if (lastMsg.message) {
          lastMessage = lastMsg.message.length > 30 
            ? lastMsg.message.substring(0, 30) + '...' 
            : lastMsg.message;
        } else if (lastMsg.attachments && lastMsg.attachments.data && lastMsg.attachments.data.length > 0) {
          const attachmentType = lastMsg.attachments.data[0].mime_type || '';
          
          if (attachmentType.startsWith('image/')) {
            lastMessage = '[Image]';
          } else if (attachmentType.startsWith('video/')) {
            lastMessage = '[Video]';
          } else if (attachmentType.startsWith('audio/')) {
            lastMessage = '[Audio]';
          } else {
            lastMessage = '[Attachment]';
          }
        }
      }

      const otherParticipant = conversation.participants && 
        conversation.participants.data && 
        conversation.participants.data.length > 1 ? 
        conversation.participants.data[1] : 
        { username: 'Unknown', id: '', profile_picture: undefined };

      return {
        id: conversation.id,
        username: otherParticipant.username,
        lastMessage,
        unreadCount: conversation.unread_count || 0,
        avatar: otherParticipant.profile_picture,
      };
    });

    return chats;
  } catch (error) {
    console.error("Error fetching Instagram chats:", error);
    return { error: "Failed to fetch chats" };
  }
}

/**
 * Fetch messages for a specific chat
 */
export async function fetchChatMessages(chatId: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/${chatId}/messages?fields=message,from,created_time,attachments`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken?.value}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to fetch messages: ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json();

    const messages = data.map((message: InstagramMessage) => {
      const formattedMessage = {
        id: message.id,
        text: message.message || "",
        sender: message.from.username || message.from.id,
        timestamp: message.created_time,
      } as Message;

      if (message.attachments && message.attachments.data && message.attachments.data.length > 0) {
        formattedMessage.attachments = message.attachments.data.map(attachment => ({
          type: attachment.mime_type.startsWith('image/') ? 'image' : 
                attachment.mime_type.startsWith('video/') ? 'video' : 'file',
          payload: {
            url: attachment.url
          }
        }));
      }

      return formattedMessage;
    });

    return messages;
  } catch (error) {
    console.error("Error fetching Instagram messages:", error);
    return { error: "Failed to fetch messages" };
  }
}

/**
 * Send a message to a chat
 */
export async function sendChatMessage(chatId: string, messageText: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const recipientId = chatId;
    console.log("Sending message using chat ID as recipient:", recipientId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      text: messageText,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending Instagram message:", error);
    return { error: "Failed to send message" };
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");
  
  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me?fields=username,id`,
      {
        headers: {
          Authorization: `Bearer ${accessToken?.value}`,
        },
      }
    );
    
    if (!response.ok) {
      return { error: "Instagram authentication failed" };
    }
    
    const instagramUser = await response.json();
    
    return {
      id: instagramUser.id,
      username: instagramUser.username,
      provider: "instagram",
    };
  } catch (error) {
    console.error("Instagram auth error:", error);
    return { error: "Authentication failed" };
  }
}