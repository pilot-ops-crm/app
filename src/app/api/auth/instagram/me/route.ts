import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const instagramToken = cookieStore.get("instagram_access_token");
    
    if (instagramToken) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/v23.0/me?fields=username,id`,
          {
            headers: {
              Authorization: `Bearer ${instagramToken.value}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Instagram authentication failed");
        }
        
        const instagramUser = await response.json();
        
        return NextResponse.json({
          id: instagramUser.id,
          username: instagramUser.username,
          provider: "instagram",
        });
      } catch (error) {
        console.error("Instagram auth error:", error);
        return NextResponse.json(
          { error: "Instagram authentication failed" },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
} 