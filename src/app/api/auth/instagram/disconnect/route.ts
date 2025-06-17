import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Create response
  const response = NextResponse.json({ success: true });
  
  // Delete cookie on the response
  response.cookies.delete("instagram_access_token");
  
  return response;
} 