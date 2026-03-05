// src/__tests__/integration/adminUserService.test.ts
import mongoose from "mongoose";
import { AdminUserService } from "../../services/admin/user.services";
import { UserModel } from "../../models/user.model";
import { connectDatabase } from "../../database/db";

describe("AdminUserService Integration Test", () => {
  let service: AdminUserService;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDatabase(); // connect once
    }
    service = new AdminUserService();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({}); // clean DB
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should get all users with pagination", async () => {
    await UserModel.create([
      { email: "user1@test.com", username: "user1", password: "pass123", fullName: "User One", phoneNumber: "111", imageUrl: "" },
      { email: "user2@test.com", username: "user2", password: "pass123", fullName: "User Two", phoneNumber: "222", imageUrl: "" },
    ]);

    const res = await service.getAllUsers("1", "1");
    expect(res.users.length).toBe(1);
    expect(res.pagination.totalItems).toBe(2);
  });

  it("should get user by id", async () => {
    const created = await UserModel.create({ email: "getbyid@test.com", username: "getbyid", password: "pass123", fullName: "Get By Id", phoneNumber: "333", imageUrl: "" });
    const user = await service.getUserById(created._id.toString());
    expect(user.email).toBe("getbyid@test.com");
  });

  it("should delete a user", async () => {
    const created = await UserModel.create({ email: "delete@test.com", username: "deleteuser", password: "pass123", fullName: "Delete User", phoneNumber: "444", imageUrl: "" });
    const deleted = await service.deleteUser(created._id.toString());
   
    const find = await UserModel.findById(created._id);
    expect(find).toBeNull();
  });

  it("should throw error if user not found for delete", async () => {
    await expect(service.deleteUser(new mongoose.Types.ObjectId().toString()))
      .rejects.toThrow("User not found");
  });

  // Optional: test update
  it("should update user", async () => {
    const created = await UserModel.create({ email: "update@test.com", username: "updateuser", password: "pass123", fullName: "Update User", phoneNumber: "555", imageUrl: "" });
    const updated = await service.updateUser(created._id.toString(), { fullName: "Updated Name" });
   
  });

  it("should throw error if user not found for update", async () => {
    await expect(service.updateUser(new mongoose.Types.ObjectId().toString(), { fullName: "No User" }))
      .rejects.toThrow("User not found");
  });
});