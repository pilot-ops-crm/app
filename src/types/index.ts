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
  participantId: string;
  lastMessage: string;
  unreadCount: number;
}

export type InstagramMessageSender = {
  id: string;
  username?: string;
}

export type InstagramMessage = {
  id: string;
  message: string;
  from: InstagramMessageSender;
  created_time: string;
  attachments?: {
    data: Array<{
      mime_type?: string;
      url?: string;
      name?: string;
      title?: string;
      type?: string;
      file_url?: string;
      audio_url?: string;
      asset_url?: string;
      image_data?: {
        url: string;
        width: number;
        height: number;
        max_width: number;
        max_height: number;
        preview_url?: string;
      };
      video_data?: {
        url: string;
        width?: number;
        height?: number;
      };
    }>;
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
    };
  };
}

export type Message = {
  id: string;
  text?: string;
  sender: string;
  timestamp: string;
  attachments?: Array<{
    type: string;
    payload: {
      url: string;
      title?: string;
    };
  }>;
}