import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const signature = headersList.get("x-hub-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Instagram webhook payload:", JSON.stringify(body, null, 2));
    
    if (body.object === "instagram" && body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messagingEvent of entry.messaging) {
            console.log("Processing messaging event:", messagingEvent);
            
            const senderId = messagingEvent.sender?.id;
            
            if (messagingEvent.message) {
              console.log("Message event from sender:", senderId);
              if (messagingEvent.message.text) {
                console.log("Text message:", messagingEvent.message.text);
              }
              if (messagingEvent.message.attachments) {
                console.log("Message with attachments:", messagingEvent.message.attachments);
              }
            } 
            else if (messagingEvent.reaction) {
              console.log("Reaction event:", messagingEvent.reaction);
            }
            else if (messagingEvent.read) {
              console.log("Message read event:", messagingEvent.read);
            }
            else if (messagingEvent.postback) {
              console.log("Postback event:", messagingEvent.postback);
            }
          }
        }
        else if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            console.log("Change event:", change);
            if (change.field === "messages") {
              console.log("Message-related change:", change.value);
            }
          }
        }
        else {
          console.log("Unknown entry structure:", entry);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
} 