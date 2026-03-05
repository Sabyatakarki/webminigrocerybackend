// src/__tests__/unit/UserService.test.ts
import { UserService } from "../../services/user.service";
import { IUserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../config/email";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../config/email");

describe("UserService Unit Tests", () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let userService: UserService;

  const fakeUser = {
    _id: "user1",
    email: "test@example.com",
    username: "testuser",
    password: "hashedPassword",
    fullName: "Test User",
    phoneNumber: "1234567890",
    role: "user",
  } as any;

  beforeEach(() => {
    userRepositoryMock = {
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    userService = new UserService();
    jest.clearAllMocks();
  });


  it("should create a user successfully", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(null);
    userRepositoryMock.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");
    userRepositoryMock.createUser.mockResolvedValue(fakeUser);

    const result = await userService.createUser({
      email: "test@example.com",
      username: "testuser",
      password: "Password123!",
      fullName: "Test User",
      phoneNumber: "1234567890",
      confirmPassword:"1234567890"
    });

    expect(result.email).toBe("test@example.com");
    expect(bcryptjs.hash).toHaveBeenCalledWith("Password123!", 10);
  });

  it("should throw if email exists", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(fakeUser);

    await expect(
      userService.createUser({
        email: "test@example.com",
        username: "newuser",
        password: "Password123!",
      } as any)
    ).rejects.toThrow("Email already in use");
  });


  it("should throw if username exists", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(null);
    userRepositoryMock.getUserByUsername.mockResolvedValue(fakeUser);

    await expect(
      userService.createUser({
        email: "new@example.com",
        username: "testuser",
        password: "Password123!",
      } as any)
    ).rejects.toThrow("Username already in use");
  });


  it("should login successfully", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(fakeUser);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwtToken");

    const result = await userService.loginUser({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.token).toBe("jwtToken");
    expect(result.user.email).toBe("test@example.com");
  });

  it("should throw if user not found", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(null);

    await expect(
      userService.loginUser({ email: "none@test.com", password: "123" })
    ).rejects.toThrow("User not found");
  });

  it("should throw if password invalid", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(fakeUser);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.loginUser({ email: "test@example.com", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should get user by id", async () => {
    userRepositoryMock.getUserById.mockResolvedValue(fakeUser);

    const result = await userService.getUserById("user1");
    expect(result.email).toBe("test@example.com");
  });

  it("should throw if id missing", async () => {
    await expect(userService.getUserById("")).rejects.toThrow("User ID is required");
  });

  it("should throw if user not found", async () => {
    userRepositoryMock.getUserById.mockResolvedValue(null);

    await expect(userService.getUserById("fake")).rejects.toThrow("User not found");
  });

  it("should update user successfully", async () => {
    userRepositoryMock.getUserById.mockResolvedValue(fakeUser);
    userRepositoryMock.getUserByEmail.mockResolvedValue(null);
    userRepositoryMock.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("newHashed");
    userRepositoryMock.updateUser.mockResolvedValue({
      ...fakeUser,
      fullName: "Updated",
    });

    const result = await userService.updateUser("user1", {
      fullName: "Updated",
      password: "NewPass123!",
    });
    expect(bcryptjs.hash).toHaveBeenCalled();
  });

  it("should throw if update user not found", async () => {
    userRepositoryMock.getUserById.mockResolvedValue(null);

    await expect(
      userService.updateUser("user1", { fullName: "Fail" })
    ).rejects.toThrow("User not found");
  });

  it("should send reset email", async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(fakeUser);
    (jwt.sign as jest.Mock).mockReturnValue("resetToken");
    (sendEmail as jest.Mock).mockResolvedValue(null);

    const result = await userService.sendResetPasswordEmail("test@example.com");

    expect(result.email).toBe("test@example.com");
    expect(sendEmail).toHaveBeenCalled();
  });

  it("should reset password successfully", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    userRepositoryMock.getUserById.mockResolvedValue(fakeUser);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("newHashed");
    userRepositoryMock.updateUser.mockResolvedValue({
      ...fakeUser,
      password: "newHashed",
    });

    const result = await userService.resetPassword("token", "newPass");
    expect(result.password).toBe("newHashed");
  });

  it("should throw if token invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    await expect(
      userService.resetPassword("bad", "newPass")
    ).rejects.toThrow("Invalid or expired token");
  });

  
});