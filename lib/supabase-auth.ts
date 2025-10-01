import { Context } from "hono";
import { getCookie } from "hono/cookie";

export interface AuthContext {
  userId: string;
  phoneNumber: string;
}

export const supabaseAuth = async (c: Context): Promise<AuthContext | null> => {
  const userCookie = getCookie(c, "user");

  console.log("🍪 Cookie value:", userCookie);

  if (!userCookie) {
    console.log("❌ No user cookie found");
    return null;
  }

  try {
    const user = JSON.parse(userCookie);
    console.log("✅ Parsed user from cookie:", user);
    return {
      userId: user.id,
      phoneNumber: user.phone_number,
    };
  } catch (error) {
    console.log("❌ Error parsing cookie:", error);
    return null;
  }
};

export const getAuth = (c: Context): AuthContext | null => {
  return c.get("auth");
};

export const supabaseMiddleware = () => {
  return async (c: Context, next: Function) => {
    const auth = await supabaseAuth(c);
    console.log("🔒 Middleware auth:", auth);
    c.set("auth", auth);
    await next();
  };
};
