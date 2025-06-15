import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID!,
        client_secret: INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }

    const { access_token } = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
    );

    if (!profileResponse.ok) {
      throw new Error("Failed to get user profile");
    }

    const { username } = await profileResponse.json();
    console.log(username);

    // Store the access token in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("instagram_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=instagram_connected`);
  } catch (error) {
    console.error("Instagram auth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=auth_failed`
    );
  }
} 