// src/__tests__/unit/AdminUserService.test.ts
import { AdminUserService } from "../../services/admin/user.services";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

jest.mock("../../repositories/user.repository");
jest.mock("bcryptjs");

describe("AdminUserService Unit Tests", () => {
  let adminService: AdminUserService;
  const fakeUser = {
    _id: "user1",
    email: "test@example.com",
    username: "testuser",
    password: "hashedPassword",
  };

  beforeEach(() => {
    adminService = new AdminUserService();
    jest.clearAllMocks();
  });

  it("should create user successfully", async () => {
    (UserRepository.prototype.getUserByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.prototype.getUserByUsername as jest.Mock).mockResolvedValue(null);
    (UserRepository.prototype.createUser as jest.Mock).mockResolvedValue(fakeUser);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await adminService.createUser({
      email: "test@example.com",
      username: "testuser",
      password: "Password123",
    } as any);

    expect(result.email).toBe("test@example.com");
    expect(bcryptjs.hash).toHaveBeenCalled();
  });

  it("should throw if email exists", async () => {
    (UserRepository.prototype.getUserByEmail as jest.Mock).mockResolvedValue(fakeUser);

    await expect(
      adminService.createUser({ email: "test@example.com", username: "newuser", password: "123" } as any)
    ).rejects.toThrow(HttpError);
  });

  it("should throw if username exists", async () => {
    (UserRepository.prototype.getUserByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.prototype.getUserByUsername as jest.Mock).mockResolvedValue(fakeUser);

    await expect(
      adminService.createUser({ email: "new@example.com", username: "testuser", password: "123" } as any)
    ).rejects.toThrow(HttpError);
  });

  it("should get all users with pagination", async () => {
    (UserRepository.prototype.getAllUsers as jest.Mock).mockResolvedValue({
      users: [fakeUser],
      total: 1,
    });

    const result = await adminService.getAllUsers("1", "10");
    expect(result.users.length).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("should delete user successfully", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(fakeUser);
    (UserRepository.prototype.deleteUser as jest.Mock).mockResolvedValue(true);

    const result = await adminService.deleteUser("user1");
    expect(result).toBe(true);
  });

  it("should throw when deleting non-existing user", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(adminService.deleteUser("invalid")).rejects.toThrow(HttpError);
  });

  it("should update user successfully", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(fakeUser);
    (UserRepository.prototype.updateUser as jest.Mock).mockResolvedValue({
      ...fakeUser,
      username: "updatedUser",
    });

    const result = await adminService.updateUser("user1", { username: "updatedUser" } as any);

  });

  it("should throw when updating non-existing user", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(adminService.updateUser("invalid", { username: "x" } as any)).rejects.toThrow(HttpError);
  });

  it("should get user by id successfully", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(fakeUser);

    const result = await adminService.getUserById("user1");
    expect(result.email).toBe("test@example.com");
  });

  it("should throw when getting non-existing user by id", async () => {
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(adminService.getUserById("invalid")).rejects.toThrow(HttpError);
  });
});