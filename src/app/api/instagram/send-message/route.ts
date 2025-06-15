import { NextResponse } from 'next/server';
import { serverSendMessage } from '@/lib/server-instagram';
import { getCookieValue } from '@/lib/auth-helpers';

// In a real implementation, you would use the instagram-private-api package
// import { IgApiClient } from 'instagram-private-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, text, mediaId } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }
    
    if (!text && !mediaId) {
      return NextResponse.json(
        { error: 'Text or media is required' },
        { status: 400 }
      );
    }
    
    // Get the username from cookies
    const username = await getCookieValue('ig_user');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use our server-side Instagram client to send the message
    const message = await serverSendMessage(username, threadId, text, mediaId);
    
    return NextResponse.json({ message, status: 'ok' });
  } catch (error: unknown) {
    console.error('Send message error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    const status = errorMessage === 'Not authenticated' ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 