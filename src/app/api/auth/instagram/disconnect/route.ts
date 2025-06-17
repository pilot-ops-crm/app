import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("Disconnecting Instagram...");
    const cookieStore = await cookies();
    
    cookieStore.set("instagram_access_token", "", {
      maxAge: 0,
      path: "/",
    });
    
    console.log("Instagram access token cookie cleared");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=instagram_disconnected`);
  } catch (error) {
    console.error("Instagram disconnect error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=disconnect_failed`
    );
  }
} 