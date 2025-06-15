import { cookies } from "next/headers";

/**
 * Gets a cookie value from the request
 */
export async function getCookieValue(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

/**
 * Sets a cookie in the response
 */
export async function setCookie(name: string, value: string, options?: {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
}): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, options);
} 