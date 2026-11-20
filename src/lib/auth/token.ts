import { SignJWT, jwtVerify, JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "secondcart_token";

const getJwtSecretKey = () => {
  const secret =
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "secondcart_default_fallback_jwt_secret_key_at_least_32_characters_long";
  return new TextEncoder().encode(secret);
};

export interface TokenPayload extends JWTPayload {
  id: string;
  email: string;
  name: string;
}

export async function signToken(payload: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
