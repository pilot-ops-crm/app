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