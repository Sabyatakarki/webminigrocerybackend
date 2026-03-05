// src/__tests__/unit/user-schema.test.ts
import { UserSchema } from "../../types/user.types";

describe("UserSchema Validation", () => {
  it("should pass for valid user data", () => {
    const validUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "1234567890",
      role: "user",
      imageUrl: "http://example.com/image.png",
    };

    expect(() => UserSchema.parse(validUser)).not.toThrow();
  });

  it("should apply default role if not provided", () => {
    const userWithoutRole = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "1234567890",
    };

    const parsed = UserSchema.parse(userWithoutRole);
    expect(parsed.role).toBe("user");
  });

  it("should fail if username is empty", () => {
    const invalidUser = {
      username: "",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "1234567890",
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });

  it("should fail if email is invalid", () => {
    const invalidUser = {
      username: "testuser",
      email: "not-an-email",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "1234567890",
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });

  it("should fail if password is too short", () => {
    const invalidUser = {
      username: "testuser",
      email: "test@example.com",
      password: "123",
      fullName: "Test User",
      phoneNumber: "1234567890",
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });

  it("should fail if role is invalid", () => {
    const invalidUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "1234567890",
      role: "superadmin",
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });

  it("should fail if phoneNumber is too short", () => {
    const invalidUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      phoneNumber: "123",
    };

    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });
});