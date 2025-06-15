import { NextRequest, NextResponse } from 'next/server';
import { serverLogin } from '@/lib/server-instagram';
import { setCookie } from '@/lib/auth-helpers';

// In a real implementation, you would use the instagram-private-api package
// import { IgApiClient } from 'instagram-private-api';

/**
 * Handle Instagram login requests
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    try {
      const user = await serverLogin(username, password);
      
      // Set a cookie to indicate the user is logged in
      setCookie('ig_user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.json({ user });
    } catch (error: any) {
      console.error('Instagram login error:', error);
      
      // Check if this is a challenge error
      if (error.message && (
        error.message.includes('security verification') || 
        error.message.includes('challenge') || 
        error.message.includes('verification required')
      )) {
        return NextResponse.json(
          { 
            error: error.message,
            challengeRequired: true
          },
          { status: 401 }
        );
      }
      
      // Handle other errors
      return NextResponse.json(
        { error: error.message || 'Authentication failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 