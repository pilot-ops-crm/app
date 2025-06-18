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
      `https://graph.instagram.com/${params.chatId}/messages?fields=message,from,created_time&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const { data } = await response.json() as { data: InstagramMessage[] };

    const messages: Message[] = data.map((message: InstagramMessage) => ({
      id: message.id,
      text: message.message!,
      sender: message.from.username!,
      timestamp: message.created_time,
    }));

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
    const { recipient, message } = body;
    
    if (!recipient || !recipient.id || !message) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://graph.instagram.com/v23.0/${params.chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          recipient: { id: recipient.id },
          message: message.text ? { text: message.text } : message
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Instagram API error:", errorData);
      throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as { id: string };

    return NextResponse.json({
      id: data.id,
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