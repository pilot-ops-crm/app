import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { InstagramMessage, Message } from "@/types";

/**
 * Handles GET requests to retrieve messages for a specific Instagram chat.
 *
 * Extracts the Instagram access token from cookies and fetches messages for the given chat ID from the Instagram Graph API. Returns a JSON array of messages with their IDs, text, sender usernames, and timestamps. Responds with appropriate error messages and status codes if authentication fails or if message retrieval encounters an error.
 */
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

/**
 * Sends a message to a specified Instagram chat using the Instagram Graph API.
 *
 * Expects a JSON request body containing a `recipient` object with an `id` and a `message` object. Returns a JSON response with the sent message's ID, text, and timestamp. Responds with appropriate error messages and status codes for authentication, validation, or API failures.
 */
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