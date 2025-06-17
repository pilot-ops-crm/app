import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("instagram_access_token");

    console.log("All cookies:", cookieStore.getAll().map(c => c.name));

    if (!accessToken) {
      console.log("No Instagram access token found in cookies");
      return NextResponse.json({ connected: false });
    }

    console.log("Found Instagram access token in cookies, validating with API...");
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken.value}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Instagram API error:", errorData);
      
      if (response.status === 400) {
        console.log("Clearing invalid Instagram access token");
        cookieStore.set("instagram_access_token", "", { 
          maxAge: 0,
          path: "/"
        });
      }
      
      throw new Error(`Invalid access token: ${errorData}`);
    }

    const { username, id } = await response.json();
    console.log("Instagram connected as:", username, id);
    return NextResponse.json({ connected: true, username, id });
  } catch (error) {
    console.error("Instagram connection check failed:", error);
    return NextResponse.json({ connected: false, error: String(error) });
  }
} 