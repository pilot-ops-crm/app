import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Chat, InstagramConversation } from "@/types";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/conversations?fields=participants,updated_time,unread_count,messages{id,from,message,created_time,attachments}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken.value}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to fetch conversations: ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json() as { data: InstagramConversation[] };
    
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    const chats: Chat[] = data.map((conversation: InstagramConversation) => {
      let lastMessage = "No messages yet";
      if (conversation.messages && conversation.messages.data && conversation.messages.data.length > 0) {
        const lastMsg = conversation.messages.data[0];
        
        if (lastMsg.message) {  
          lastMessage = lastMsg.message.length > 30  
            ? lastMsg.message.substring(0, 30) + "…"  
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
      };
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching Instagram chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}