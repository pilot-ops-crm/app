import { UUID } from "crypto";

export type User = {
  id: UUID;
  email: string;
  name?: string | null;
  gender?: string | null;

  use_case?: string[] | null;
  leads_per_month?: string | null;
  active_platforms?: string[] | null;

  business_type?: string | null;
  pilot_goal?: string[] | null;
  current_tracking?: string[] | null;

  onboarding_complete: boolean;

  created_at: string; // timestamp in ISO format
  updated_at: string; // timestamp in ISO format
};

type InstagramParticipant = {
  username: string;
  id: string;
  profile_picture?: string;
}

export type InstagramConversation = {
  id: string;
  participants: {
    data: InstagramParticipant[];
  };
  updated_time: string;
  messages: {
    data: InstagramMessage[];
  };
  unread_count: number;
}

export type Chat = {
  id: string;
  username: string;
  lastMessage: string;
  unreadCount: number;
  participants?: string[];
};

export type InstagramMessageSender = {
  id: string;
  username?: string;
}

export type InstagramMessage = {
  id: string;
  text?: string;
  sender: string;
  timestamp: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
  is_deleted?: boolean;
  is_echo?: boolean;
  error?: never;
};

export type Message = {
  id: string;
  text: string;
  sender: string | undefined;
  timestamp: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
    };
  }>;
}