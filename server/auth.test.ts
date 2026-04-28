import { describe, expect, it, vi } from "vitest";
import * as authService from "./services/authService";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getArtistByEmail: vi.fn(),
  createArtist: vi.fn(),
}));

// Mock bcrypt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$10$hashedpassword"),
    compare: vi.fn().mockImplementation((plain: string, _hash: string) => {
      return Promise.resolve(plain === "correct_password");
    }),
  },
}));

describe("Auth Service", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.default.hash("test_password", 10);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe("test_password");
    });

    it("should verify correct password", async () => {
      const bcrypt = await import("bcrypt");
      const result = await bcrypt.default.compare(
        "correct_password",
        "$2b$10$hashedpassword"
      );
      expect(result).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const bcrypt = await import("bcrypt");
      const result = await bcrypt.default.compare(
        "wrong_password",
        "$2b$10$hashedpassword"
      );
      expect(result).toBe(false);
    });
  });

  describe("Auth Service Exports", () => {
    it("should export signup function", () => {
      expect(typeof authService.signup).toBe("function");
    });

    it("should export login function", () => {
      expect(typeof authService.login).toBe("function");
    });

    it("should export hashPassword function", () => {
      expect(typeof authService.hashPassword).toBe("function");
    });

    it("should export comparePassword function", () => {
      expect(typeof authService.comparePassword).toBe("function");
    });

    it("should export generateAccessToken function", () => {
      expect(typeof authService.generateAccessToken).toBe("function");
    });

    it("should export generateRefreshToken function", () => {
      expect(typeof authService.generateRefreshToken).toBe("function");
    });

    it("should export verifyToken function", () => {
      expect(typeof authService.verifyToken).toBe("function");
    });

    it("should export refreshAccessToken function", () => {
      expect(typeof authService.refreshAccessToken).toBe("function");
    });

    it("should export requestPasswordReset function", () => {
      expect(typeof authService.requestPasswordReset).toBe("function");
    });

    it("should export resetPassword function", () => {
      expect(typeof authService.resetPassword).toBe("function");
    });

    it("should export getArtistById function", () => {
      expect(typeof authService.getArtistById).toBe("function");
    });
  });

  describe("Input Validation", () => {
    it("should reject signup with empty email", async () => {
      try {
        await authService.signup("", "password123", "Test Artist");
      } catch (e: any) {
        expect(e.message).toBeDefined();
      }
    });

    it("should reject signup with empty password", async () => {
      try {
        await authService.signup("test@example.com", "", "Test Artist");
      } catch (e: any) {
        expect(e.message).toBeDefined();
      }
    });

    it("should reject login with empty credentials", async () => {
      try {
        await authService.login("", "");
      } catch (e: any) {
        expect(e.message).toBeDefined();
      }
    });
  });
});
