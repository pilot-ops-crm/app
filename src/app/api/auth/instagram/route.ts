import { NextResponse } from "next/server";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const REDIRECT_URI = `https://698f-103-47-33-33.ngrok-free.app/api/auth/instagram/callback`;

export async function GET() {
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile&response_type=code`;
  
  return NextResponse.redirect(authUrl);
}