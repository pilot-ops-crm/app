import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("instagram_access_token");

  if (!accessToken) {
    return NextResponse.json({ connected: false });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      throw new Error("Invalid access token");
    }

    const { username } = await response.json();
    console.log(username);
    return NextResponse.json({ connected: true, username });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
} 