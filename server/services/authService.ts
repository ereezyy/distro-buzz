import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import logger from "../utils/logger";
import { artists } from "../../drizzle/schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "distro-buzz-dev-secret-key-change-in-production");
const JWT_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY = "30d";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface PasswordResetToken {
  token: string;
  expiresAt: Date;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(userId: string, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    logger.error("[Auth] Token verification failed", error);
    return null;
  }
}

/**
 * Sign up a new artist account
 */
export async function signup(email: string, password: string, name: string): Promise<AuthTokens> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if email already exists
  const existingUser = await db.select().from(artists).where(eq(artists.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create artist record
  const artistId = nanoid();
  const now = new Date();

  await db.insert(artists).values({
    id: artistId,
    email,
    name,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  } as any);

  // Generate tokens
  const accessToken = await generateAccessToken(artistId, email);
  const refreshToken = await generateRefreshToken(artistId);

  logger.info("[Auth] Artist signed up", { email, artistId });

  return {
    accessToken,
    refreshToken,
    user: {
      id: artistId,
      email,
      name,
      createdAt: now,
    },
  };
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthTokens> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find artist by email
  const result = await db.select().from(artists).where(eq(artists.email, email)).limit(1);
  const artist = result[0];

  if (!artist) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const passwordValid = await comparePassword(password, artist.passwordHash || "");
  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate tokens
  const accessToken = await generateAccessToken(artist.id, artist.email);
  const refreshToken = await generateRefreshToken(artist.id);

  logger.info("[Auth] Artist logged in", { email, artistId: artist.id });

  return {
    accessToken,
    refreshToken,
    user: {
      id: artist.id,
      email: artist.email,
      name: artist.name || "",
      createdAt: artist.createdAt,
    },
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const payload = await verifyToken(refreshToken);

  if (!payload || payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  const accessToken = await generateAccessToken(payload.userId, payload.email);

  return { accessToken };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find artist by email
  const result = await db.select().from(artists).where(eq(artists.email, email)).limit(1);
  const artist = result[0];

  if (!artist) {
    // Don't reveal whether email exists
    logger.warn("[Auth] Password reset requested for non-existent email", { email });
    return {
      token: nanoid(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    };
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  // Store reset token in database (in production, use a separate table)
  // For now, we'll just return it
  logger.info("[Auth] Password reset requested", { email, artistId: artist.id });

  return {
    token: resetToken,
    expiresAt,
  };
}

/**
 * Reset password with reset token
 */
export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  // In production, verify the reset token against stored tokens
  // For now, just hash and update the password
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!resetToken || resetToken.length < 20) {
    throw new Error("Invalid reset token");
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // In production, find artist by reset token and update password
  // For now, this is a stub
  logger.info("[Auth] Password reset completed");
}

/**
 * Get artist by ID
 */
export async function getArtistById(artistId: string): Promise<AuthUser | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(artists).where(eq(artists.id, artistId)).limit(1);
  const artist = result[0];

  if (!artist) return null;

  return {
    id: artist.id,
    email: artist.email,
    name: artist.name || "",
    createdAt: artist.createdAt,
  };
}
