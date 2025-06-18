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
      const lastMsg = conversation.messages?.data?.[0];
      
      if (lastMsg?.message) {
        lastMessage = lastMsg.message.length > 30 
          ? lastMsg.message.substring(0, 30) + '...' 
          : lastMsg.message;
      } else if (lastMsg?.attachments?.data?.[0]) {
        const attachment = lastMsg.attachments.data[0];
        const mimeType = attachment.mime_type || '';
        
        if (mimeType.startsWith('image/')) {
          lastMessage = '[Image]';
        } else if (mimeType.startsWith('video/')) {
          lastMessage = '[Video]';
        } else if (mimeType.startsWith('audio/')) {
          lastMessage = '[Audio]';
        } else {
          lastMessage = '[Attachment]';
        }
      }

      const otherParticipant = conversation.participants?.data?.length > 1
        ? conversation.participants.data[1]
        : { username: 'Unknown', id: '', profile_picture: undefined };

      return {
        id: conversation.id,
        username: otherParticipant.username,
        participantId: otherParticipant.id,
        lastMessage,
        unreadCount: conversation.unread_count || 0,
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

  if (!accessToken) {
    return { error: "Not authenticated" };
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/${chatId}/messages?fields=message,from,created_time,attachments`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken.value}`
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
        sender: message.from?.username || message.from?.id,
        timestamp: message.created_time,
      } as Message;

      if (message.attachments?.data?.[0]) {
        formattedMessage.attachments = message.attachments.data.map(attachment => {
          const mimeType = attachment.mime_type || '';
          let type = 'file';
          
          if (mimeType.startsWith('image/')) {
            type = 'image';
          } else if (mimeType.startsWith('video/')) {
            type = 'video';
          } else if (mimeType.startsWith('audio/')) {
            type = 'audio';
          }
          
          return {
            type,
            payload: {
              url: attachment.url
            }
          };
        });
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
 * Get the participant ID for a given chat ID
 */
async function getParticipantId(chatId: string): Promise<string> {
  if (chatId.startsWith('ig_')) {
    return chatId;
  }
  
  const chatsResult = await fetchInstagramChats();
  if (Array.isArray(chatsResult)) {
    const chat = chatsResult.find(c => c.id === chatId);
    if (chat && chat.participantId) {
      return chat.participantId;
    }
  }
  
  console.warn(`Could not find participant ID for chat ${chatId}, falling back to conversation ID`);
  return chatId;
}

/**
 * Send a message to a chat
 */
export async function sendChatMessage(chatId: string, messageText: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending message to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
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
 * Send an image message
 */
export async function sendImageMessage(chatId: string, imageUrl: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending image to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
          message: {
            attachment: {
              type: "image",
              payload: {
                url: imageUrl
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send image: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      attachment: { type: "image", url: imageUrl },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending Instagram image:", error);
    return { error: "Failed to send image" };
  }
}

/**
 * Send a video message
 */
export async function sendVideoMessage(chatId: string, videoUrl: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending video to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
          message: {
            attachment: {
              type: "video",
              payload: {
                url: videoUrl
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send video: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      attachment: { type: "video", url: videoUrl },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending Instagram video:", error);
    return { error: "Failed to send video" };
  }
}

/**
 * Send a sticker message
 */
export async function sendStickerMessage(chatId: string, stickerId: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending sticker to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "sticker",
                sticker_id: stickerId
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send sticker: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      attachment: { type: "sticker", stickerId },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending Instagram sticker:", error);
    return { error: "Failed to send sticker" };
  }
}

/**
 * React to a message
 */
export async function reactToMessage(chatId: string, messageId: string, emoji: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending reaction to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
          message: {
            reaction: {
              mid: messageId,
              action: "react",
              emoji: emoji
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to react to message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      reaction: { messageId, emoji },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error reacting to Instagram message:", error);
    return { error: "Failed to react to message" };
  }
}

/**
 * Send an Instagram post
 */
export async function sendInstagramPost(chatId: string, postId: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  try {
    const participantId = await getParticipantId(chatId);
    console.log("Sending post to participant:", participantId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken?.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId },
          message: {
            attachment: {
              type: "MEDIA_SHARE",
              payload: {
                id: postId
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send Instagram post: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    revalidatePath(`/`);

    return {
      id: data.message_id,
      attachment: { type: "post", postId },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error sending Instagram post:", error);
    return { error: "Failed to send post" };
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