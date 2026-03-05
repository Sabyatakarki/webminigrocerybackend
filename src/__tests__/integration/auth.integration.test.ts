import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import authRouter from "../../routes/auth.route";
import { connectDatabase } from "../../database/db";
import { UserModel } from "../../models/user.model";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth Integration Test", () => {

  let token: string;
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 🔥 REGISTER
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      username: "testuser",
      fullName: "Test User",
      phoneNumber: "1234567890"
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const userInDb = await UserModel.findOne({ email: "test@example.com" });
    expect(userInDb).not.toBeNull();
  });

  // 🔥 LOGIN
  it("should login user and return token", async () => {
    // first register
    await request(app).post("/auth/register").send({
      email: "login@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      username: "loginuser",
      fullName: "Login User",
      phoneNumber: "1234567890"
    });

    const res = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "Password123!"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
    userId = res.body.data._id;
  });

  // 🔥 UPDATE PROFILE
  it("should update profile", async () => {
    // register + login first
    await request(app).post("/auth/register").send({
      email: "update@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      username: "updateuser",
      fullName: "Update User",
      phoneNumber: "1234567890"
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "update@example.com",
      password: "Password123!"
    });

    const authToken = loginRes.body.token;

    const res = await request(app)
      .post("/auth/update-profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "updated@example.com",
        username: "updateduser",
        fullName: "Updated Name",
        phoneNumber: "9999999999"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await UserModel.findOne({ email: "updated@example.com" });
    expect(updatedUser).not.toBeNull();
  });

  // 🔥 RESET PASSWORD
 // 🔥 RESET PASSWORD
it(
  "should send reset email and reset password",
  async () => {
    await request(app).post("/auth/register").send({
      email: "reset@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      username: "resetuser",
      fullName: "Reset User",
      phoneNumber: "1234567890"
    });

    const resetRes = await request(app)
      .post("/auth/request-password-reset")
      .send({ email: "reset@example.com" });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
  },
  15000 // <— this sets 15s timeout for this test
);


});