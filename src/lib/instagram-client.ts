/**
 * Instagram Client utility
 * This implements a client-side wrapper around our server API
 */

export interface User {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
}

export interface Message {
  item_id: string;
  user_id: string;
  timestamp: number;
  text?: string;
  media?: {
    url: string;
    type: string;
  };
}

export interface Conversation {
  thread_id: string;
  users: Array<{
    pk: string;
    username: string;
    full_name?: string;
    profile_pic_url?: string;
  }>;
  items?: Message[];
  last_activity_at: number;
}

// Track if we're authenticated on the client
let isAuth = false;

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  isAuth = !!localStorage.getItem('ig_user');
}

/**
 * Instagram API client functions
 */

export async function loginToInstagram(username: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/instagram/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    const user = data.user;
    
    // Store authentication state
    isAuth = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ig_user', JSON.stringify(user));
    }

    return user;
  } catch (error) {
    console.error('Instagram login error:', error);
    throw error;
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  if (!isAuth && typeof window !== 'undefined' && !localStorage.getItem('ig_user')) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('/api/instagram/conversations');
  
  if (!response.ok) {
    if (response.status === 401) {
      isAuth = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ig_user');
      }
      throw new Error('Not authenticated');
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch conversations');
  }
  
  const data = await response.json();
  return data.conversations;
}

export async function fetchThreadMessages(threadId: string): Promise<Message[]> {
  if (!isAuth && typeof window !== 'undefined' && !localStorage.getItem('ig_user')) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`/api/instagram/messages/${threadId}`);
  
  if (!response.ok) {
    if (response.status === 401) {
      isAuth = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ig_user');
      }
      throw new Error('Not authenticated');
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch messages');
  }
  
  const data = await response.json();
  return data.messages;
}

export async function sendInstagramMessage(params: { 
  threadId: string;
  text?: string;
  mediaId?: string;
}): Promise<Message> {
  if (!isAuth && typeof window !== 'undefined' && !localStorage.getItem('ig_user')) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('/api/instagram/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      isAuth = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ig_user');
      }
      throw new Error('Not authenticated');
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send message');
  }
  
  const data = await response.json();
  return data.message;
} 