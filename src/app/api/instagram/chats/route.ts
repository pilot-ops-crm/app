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
    // Fetch conversations from Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/me/conversations?fields=participants,updated_time&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }

    const { data } = await response.json() as { data: InstagramConversation[] };

    // Transform the data to match our Chat type
    const chats: Chat[] = data.map((conversation: InstagramConversation) => ({
      id: conversation.id,
      username: conversation.participants.data[0].username,
      lastMessage: "Last message", // This would need to be fetched separately
      unreadCount: 0, // This would need to be tracked separately
      avatar: conversation.participants.data[0].profile_picture,
    }));

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching Instagram chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 