import { NextResponse } from "next/server";
import { headers } from "next/headers";

const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const headersList = await headers();
  const signature = headersList.get("x-hub-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Handle different types of webhooks
    if (body.object === "instagram" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          // Handle message webhooks
          if (change.field === "messages") {
            // Process new messages
            console.log("New message received:", change.value);
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
} 