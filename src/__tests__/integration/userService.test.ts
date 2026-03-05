// src/__tests__/integration/userService.test.ts
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserService } from "../../services/user.service";
import { UserModel } from "../../models/user.model";
import { connectDatabase } from "../../database/db";
import { sendEmail } from "../../config/email";

jest.mock("../../config/email"); // Mock sendEmail

describe("UserService Integration Test", () => {
  let service: UserService;

  beforeAll(async () => {
    // Connect only if not connected
    if (mongoose.connection.readyState === 0) {
      await connectDatabase();
    }
    service = new UserService();
  });

  beforeEach(async () => {
    // Clean DB before each test
    await UserModel.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Drop test DB and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a new user", async () => {
    const user = await service.createUser({
      email: "test1@example.com",
      username: "testuser1",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Test User",
      phoneNumber: "1234567890",
      
    });

    expect(user.email).toBe("test1@example.com");
    expect(user.username).toBe("testuser1");
    expect(user.password).not.toBe("Password123!"); // Should be hashed
    expect(user.role).toBe("user"); // Default role
  });

  it("should throw error if email already exists", async () => {
    await service.createUser({
      email: "dup@example.com",
      username: "userdup1",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Dup User",
      phoneNumber: "1234567890",
      
    });

    await expect(
      service.createUser({
        email: "dup@example.com",
        username: "userdup2",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Dup User 2",
        phoneNumber: "0987654321",
      
      })
    ).rejects.toThrow("Email already in use");
  });

  it("should login a user and return token", async () => {
    await service.createUser({
      email: "login@example.com",
      username: "loginuser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Login User",
      phoneNumber: "1112223333",
     
    });

    const res = await service.loginUser({
      email: "login@example.com",
      password: "Password123!",
    });

    expect(res.token).toBeDefined();
    expect(res.user.email).toBe("login@example.com");
    expect(res.user.password).toBeUndefined(); // password removed
    expect(res.user.role).toBe("user");
  });

  it("should get user by id", async () => {
    const created = await service.createUser({
      email: "getbyid@example.com",
      username: "getbyiduser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "GetById User",
      phoneNumber: "1112223333",
   
    });

    const user = await service.getUserById(created._id.toString());
    expect(user.email).toBe("getbyid@example.com");
    expect(user.role).toBe("user");
  });

  it("should update user", async () => {
    const created = await service.createUser({
      email: "update@example.com",
      username: "updateuser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Update User",
      phoneNumber: "1112223333",
    
    });

    const updated = await service.updateUser(created._id.toString(), {
      fullName: "Updated Name",
    });

  
  });

  it("should send reset password email (mocked)", async () => {
    await service.createUser({
      email: "reset@example.com",
      username: "resetuser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Reset User",
      phoneNumber: "1112223333",
   
    });

    const user = await service.sendResetPasswordEmail("reset@example.com");

    expect(sendEmail).toHaveBeenCalled(); // Email was "sent"
    expect(user.email).toBe("reset@example.com");
  });

  it("should reset password with valid token", async () => {
    const created = await service.createUser({
      email: "token@example.com",
      username: "tokenuser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Token User",
      phoneNumber: "1112223333",

    });

    const token = jwt.sign({ id: created._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

    const updated = await service.resetPassword(token, "NewPassword123!");

    expect(updated.password).not.toBe("NewPassword123!"); // Hashed
  });
});