import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Handles GET requests to retrieve Instagram user information using an access token from cookies.
 *
 * If a valid "instagram_access_token" cookie is present, fetches the user's ID and username from the Instagram Graph API and returns them in a JSON response. Returns a 401 response if authentication fails or the token is missing, and a 500 response for unexpected errors.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const instagramToken = cookieStore.get("instagram_access_token");
    
    if (instagramToken) {
      try {
        const response = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${instagramToken.value}`,
          { cache: "no-store" }
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