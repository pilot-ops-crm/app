import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete('ig_user');
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 