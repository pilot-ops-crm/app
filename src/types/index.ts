import { UUID } from "crypto";

export interface User {
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

export interface InstagramParticipant {
  username: string;
  id: string;
  profile_picture?: string;
}

export interface InstagramConversation {
  id: string;
  unread_count?: number;
  updated_time: string;
  participants?: {
    data: InstagramParticipant[];
  };
  messages?: {
    data: InstagramMessage[];
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
    };
  };
}

export interface Chat {
  id: string;
  username: string;
  participantId: string;
  lastMessage: string;
  unreadCount: number;
}

export interface InstagramMessage {
  id: string;
  from?: {
    id: string;
    username?: string;
  };
  message?: string;
  created_time: string;
  attachments?: {
    data: Array<{
      mime_type?: string;
      name?: string;
      title?: string;
      type?: string;
      url?: string;
      image_data?: {
        url?: string;
      };
      video_data?: {
        url?: string;
      };
      file_url?: string;
      audio_url?: string;
      asset_url?: string;
    }>;
  };
  reactions?: {
    data: Array<{
      id: string;
      username?: string;
      reaction?: string;
    }>;
  };
}

export interface MessageAttachment {
  type: string;
  payload: {
    url: string;
    title?: string;
  };
}

export interface MessageReaction {
  type: string;
  sender: string;
}

export interface Message {
  id: string;
  text?: string;
  sender: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}