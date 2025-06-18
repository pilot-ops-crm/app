import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { InstagramMessage, Message } from "@/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = await context.params;

  try {
    const response = await fetch(
      `https://graph.instagram.com/v23.0/${params.chatId}/messages?fields=message,from,created_time,attachments`,
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

    const { data } = await response.json() as { data: InstagramMessage[] };

    const messages: Message[] = data.map((message: InstagramMessage) => {
      const formattedMessage: Message = {
        id: message.id,
        text: message.text || "",
        sender: message.sender,
        timestamp: message.timestamp,
      };

      if (message.attachments && message.attachments.length > 0) {
        formattedMessage.attachments = message.attachments.map(attachment => ({
          type: attachment.type,
          payload: {
            url: attachment.payload.url
          }
        }));
      }

      return formattedMessage;
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching Instagram messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = await context.params;

  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const recipientId = params.chatId;
    console.log("Sending message using chat ID as recipient:", recipientId);
    
    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: message.text ? { text: message.text } : message
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as { recipient_id: string, message_id: string };

    return NextResponse.json({
      id: data.message_id,
      text: message.text || "",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending Instagram message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}