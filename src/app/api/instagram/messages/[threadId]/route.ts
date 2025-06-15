import { NextResponse } from 'next/server';
import { serverFetchThreadMessages } from '@/lib/server-instagram';
import { getCookieValue } from '@/lib/auth-helpers';

// In a real implementation, you would use the instagram-private-api package
// import { IgApiClient } from 'instagram-private-api';

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = params.threadId;
    
    // Get the username from cookies
    const username = await getCookieValue('ig_user');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use our server-side Instagram client to fetch messages for this thread
    const messages = await serverFetchThreadMessages(username, threadId);
    
    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error('Fetch messages error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
    const status = errorMessage === 'Not authenticated' ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 