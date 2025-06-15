import { NextResponse } from 'next/server';
import { serverFetchConversations } from '@/lib/server-instagram';
import { getCookieValue } from '@/lib/auth-helpers';

// In a real implementation, you would use the instagram-private-api package
// import { IgApiClient } from 'instagram-private-api';

export async function GET() {
  try {
    // Get the username from cookies
    const username = await getCookieValue('ig_user');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use our server-side Instagram client to fetch conversations
    const conversations = await serverFetchConversations(username);
    
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Fetch conversations error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
} 