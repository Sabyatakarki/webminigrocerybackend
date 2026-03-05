// src/__tests__/integration/adminUser.integration.test.ts
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { connectDatabase } from "../../database/db";
import { UserModel } from "../../models/user.model";
import { AdminUserController } from "../../controllers/admin/user.controller";

const app = express();
app.use(express.json());

const controller = new AdminUserController();
app.post("/admin/users", (req, res, next) => controller.createUser(req, res, next));
app.get("/admin/users", (req, res, next) => controller.getAllUsers(req, res, next));
app.get("/admin/users/:id", (req, res, next) => controller.getUserById(req, res, next));
app.put("/admin/users/:id", (req, res, next) => controller.updateUser(req, res, next));
app.delete("/admin/users/:id", (req, res, next) => controller.deleteUser(req, res, next));

describe("AdminUserController Integration Tests", () => {
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a user successfully", async () => {
    const res = await request(app).post("/admin/users").send({
      email: "admin@test.com",
      username: "adminuser",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Admin User",
      phoneNumber: "1234567890",
      imageUrl: "",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userId = res.body.data._id;
  });

  it("should fail to create user with duplicate email", async () => {
    const res = await request(app).post("/admin/users").send({
      email: "admin@test.com",
      username: "adminuser2",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Admin User 2",
      phoneNumber: "0987654321",
    });

    expect(res.status).toBe(403);
  });

  it("should get all users", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should get user by id", async () => {
    const res = await request(app).get(`/admin/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("admin@test.com");
  });

  it("should update user", async () => {
    const res = await request(app).put(`/admin/users/${userId}`).send({
      fullName: "Updated Admin",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Updated Admin");
  });

  it("should delete user", async () => {
    const res = await request(app).delete(`/admin/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});