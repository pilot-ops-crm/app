import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Fetch messages from Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/${params.chatId}/messages?fields=message,from,created_time&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const { data } = await response.json();

    // Transform the data to match our Message type
    const messages = data.map((message: any) => ({
      id: message.id,
      text: message.message,
      sender: message.from.id === "me" ? "me" : "them",
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
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { message } = await request.json();

    // Send message using Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/${params.chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          access_token: accessToken.value,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();

    // Return the sent message in our Message type format
    return NextResponse.json({
      id: data.id,
      text: message,
      sender: "me",
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