// src/__tests__/unit/UserService.simple.test.ts
import { UserService } from "../../services/user.service";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/email";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../config/email");

describe("UserService Simple Unit Tests", () => {
  let userService: UserService;
  const fakeUser = {
    _id: "user1",
    email: "test@example.com",
    username: "testuser",
    password: "hashedPassword",
  } as any;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  it("creates a user successfully", async () => {
    (userService as any).userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue(null),
      getUserByUsername: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue(fakeUser),
    };
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await userService.createUser({
      email: "test@example.com",
      username: "testuser",
      password: "Password123!",
      fullName: "Test User",
      phoneNumber: "1234567890",
      confirmPassword: "1234567890",
    });

    expect(result.email).toBe("test@example.com");
    expect(bcryptjs.hash).toHaveBeenCalled();
  });

  it("logs in user successfully", async () => {
    (userService as any).userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue(fakeUser),
    };
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwtToken");

    const result = await userService.loginUser({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.token).toBe("jwtToken");
    expect(result.user.email).toBe("test@example.com");
  });

  it("sends reset email", async () => {
    (jwt.sign as jest.Mock).mockReturnValue("resetToken");
    (userService as any).userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue(fakeUser),
    };
    (sendEmail as jest.Mock).mockResolvedValue(null);

    const result = await userService.sendResetPasswordEmail("test@example.com");
    expect(result.email).toBe("test@example.com");
    expect(sendEmail).toHaveBeenCalled();
  });
});