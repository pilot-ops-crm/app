import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchInstagramChats } from '@/actions/instagram/chats';

/**
 * Helper function to get the participant ID for a given chat ID
 */
async function getParticipantId(chatId: string): Promise<string> {
  if (chatId.startsWith('ig_')) {
    return chatId;
  }
  
  const chatsResult = await fetchInstagramChats();
  if (Array.isArray(chatsResult)) {
    const chat = chatsResult.find(c => c.id === chatId);
    if (chat && chat.participantId) {
      return chat.participantId;
    }
  }
  
  console.warn(`Could not find participant ID for chat ${chatId}, falling back to conversation ID`);
  return chatId;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('instagram_access_token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, messageType, content } = body;

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    if (!messageType || !content) {
      return NextResponse.json({ error: 'Message type and content are required' }, { status: 400 });
    }

    const participantId = await getParticipantId(recipientId);
    console.log("API route sending to participant:", participantId);

    let messagePayload;

    switch (messageType) {
      case 'text':
        messagePayload = { text: content };
        break;
      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    const response = await fetch(
      `https://graph.instagram.com/v23.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: JSON.stringify({
          recipient: { id: participantId }, // Use the participant ID (IGSID)
          message: messagePayload
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      return NextResponse.json(
        { error: `Failed to send message: ${JSON.stringify(errorData)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message_id: data.message_id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}