import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("instagram_access_token");

    if (!accessToken) {
      console.log("No Instagram access token found in cookies");
      return NextResponse.json({ connected: false });
    }

    console.log("Checking Instagram connection with token");
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Instagram API error:", errorData);
      throw new Error("Invalid access token");
    }

    const { username, id } = await response.json();
    console.log("Instagram connected as:", username, id);
    return NextResponse.json({ connected: true, username, id });
  } catch (error) {
    console.error("Instagram connection check failed:", error);
    return NextResponse.json({ connected: false, error: String(error) });
  }
} 