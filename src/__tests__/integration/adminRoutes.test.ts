// src/__tests__/integration/adminUser.integration.test.ts
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import adminUserRouter from "../../routes/admin/user.routes";
import { connectDatabase } from "../../database/db";

const app = express();
app.use(express.json());
app.use("/admin/users", adminUserRouter);

describe("Admin User Routes Integration Test", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;

  beforeAll(async () => {
    await connectDatabase();
    await UserModel.deleteMany({});

    // Create admin user
    const admin = await UserModel.create({
      email: "admin@test.com",
      username: "adminuser",
      password: "Password123!",
      fullName: "Admin User",
      phoneNumber: "1234567890",
      role: "admin",
    });
    adminId = admin._id.toString();

    // Create normal user
    const user = await UserModel.create({
      email: "user@test.com",
      username: "normaluser",
      password: "Password123!",
      fullName: "Normal User",
      phoneNumber: "1112223333",
      role: "user",
    });

    const JWT_SECRET = process.env.JWT_SECRET || "secret";
    adminToken = `Bearer ${jwt.sign({ id: admin._id }, JWT_SECRET)}`;
    userToken = `Bearer ${jwt.sign({ id: user._id }, JWT_SECRET)}`;
  });

  beforeEach(async () => {
    // Keep only admin & normal user
    await UserModel.deleteMany({ email: { $nin: ["admin@test.com", "user@test.com"] } });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // ------------------- CREATE USER -------------------
  it("should create a new user successfully", async () => {
    const res = await request(app)
      .post("/admin/users")
      .set("Authorization", adminToken)
      .send({
        email: "test1@example.com",
        username: "testuser1",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Test User",
        phoneNumber: "1234567890",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test1@example.com");
  });

  it("should fail to create user with duplicate email", async () => {
    await UserModel.create({
      email: "dup@example.com",
      username: "dupuser1",
      password: "Password123!",
      fullName: "Dup User",
      phoneNumber: "1234567890",
      role: "user",
    });

    const res = await request(app)
      .post("/admin/users")
      .set("Authorization", adminToken)
      .send({
        email: "dup@example.com",
        username: "dupuser2",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Dup User 2",
        phoneNumber: "0987654321",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Email already in use");
  });

  it("should fail to create user with duplicate username", async () => {
    await UserModel.create({
      email: "unique@example.com",
      username: "sameusername",
      password: "Password123!",
      fullName: "User One",
      phoneNumber: "1234567890",
      role: "user",
    });

    const res = await request(app)
      .post("/admin/users")
      .set("Authorization", adminToken)
      .send({
        email: "another@example.com",
        username: "sameusername",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "User Two",
        phoneNumber: "0987654321",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Username already in use");
  });

  it("should fail to create user without admin token", async () => {
    const res = await request(app)
      .post("/admin/users")
      .set("Authorization", userToken)
      .send({
        email: "unauth@example.com",
        username: "unauthuser",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Unauthorized User",
        phoneNumber: "1112223333",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden not admin");
  });

  // ------------------- GET USERS -------------------
  it("should get all users", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get all users with pagination", async () => {
    const res = await request(app)
      .get("/admin/users?page=1&size=1")
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.size).toBe(1);
  });

  it("should search users by keyword", async () => {
    const res = await request(app)
      .get("/admin/users?search=admin")
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data[0].username).toBe("adminuser");
  });

  // ------------------- GET USER BY ID -------------------
  it("should get user by ID", async () => {
    const res = await request(app)
      .get(`/admin/users/${adminId}`)
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("admin@test.com");
  });

  it("should fail to get non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/admin/users/${fakeId}`)
      .set("Authorization", adminToken);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  // ------------------- UPDATE USER -------------------
  it("should update user fullName", async () => {
    const res = await request(app)
      .put(`/admin/users/${adminId}`)
      .set("Authorization", adminToken)
      .send({ fullName: "Updated Admin" });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Updated Admin");
  });

  it("should fail to update non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/admin/users/${fakeId}`)
      .set("Authorization", adminToken)
  });


});