import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const BACKEND_URL = process.env.BACKEND_URL;

export async function getValidToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get("token")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!token && !refreshToken) return null;

  if (token) {
    try {
      // Verify token locally
      await jose.jwtVerify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      return token;
    } catch (error) {
      // Token is likely expired or invalid, proceed to refresh
      console.log("Access token expired, attempting refresh...");
    }
  }

  // If we reach here, token is missing or expired. Try refreshing.
  if (refreshToken) {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/token?refreshToken=${refreshToken}`);
      const json = await res.json();

      if (res.ok && json.success && json.data.token) {
        const newToken = json.data.token;
        
        // Update the cookie for future requests
        cookieStore.set("token", newToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 60 * 60 * 12, // 12 hours
        });

        return newToken;
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  return null;
}
