// src/__tests__/integration/order.integration.test.ts
import request from "supertest";
import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from "express";
import orderRouter from "../../routes/order.routes";
import { UserModel } from "../../models/user.model";
import OrderModel from "../../models/order.model";
import ProductModel from "../../models/Product.model";
import fs from "fs";
import path from "path";

// --- Mock Middleware ---
jest.mock("../../middleware/authorized.middleware", () => ({
  authorizedMiddleware: (req: Partial<Request> & { user?: any }, res: Partial<Response>, next: NextFunction) => {
    req.user = { _id: new mongoose.Types.ObjectId(), role: "user" };
    next();
  },
  adminMiddleware: (req: Partial<Request> & { user?: any }, res: Partial<Response>, next: NextFunction) => {
    req.user = { _id: new mongoose.Types.ObjectId(), role: "admin" };
    next();
  },
}));

// --- Prevent fs copy crash during tests ---
jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    copyFileSync: jest.fn(), // skip actual file copy
    existsSync: jest.fn().mockReturnValue(true), // pretend file exists
    mkdirSync: jest.fn(),
  };
});

// --- Setup Express App ---
const app = express();
app.use(express.json());
app.use("/api/orders", orderRouter);

describe("Order Routes Integration Test", () => {
  let userId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI_TEST || "mongodb://localhost:27017/test-db"
      );
    }

    // Create a test user
    const user = await UserModel.create({
      email: "user@example.com",
      username: "user1",
      password: "hashedpassword",
      fullName: "User One",
      phoneNumber: "1234567890",
      role: "user",
    });
    userId = user._id;

    // Create a test product
    const product = await ProductModel.create({
      name: "Test Product",
      quantity: 10,
      price: 50,
      category: "Test Category",
      image: "test.png",
    });
    productId = product._id;
  });

  afterAll(async () => {
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it("POST /api/orders - should create a new order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        products: [{ product: productId, quantity: 2 }],
        totalAmount: 100,
        paymentMethod: "cash",
        shippingAddress: {
          fullName: "User One",
          phone: "1234567890",
          street: "Street 123",
          city: "Kathmandu",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
  });

  it("GET /api/orders/my - should get my orders", async () => {
    const res = await request(app).get("/api/orders/my");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/orders - admin should get all orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PUT /api/orders/:id - admin should update order status", async () => {
    const order = await OrderModel.create({
      user: userId,
      products: [{ product: productId, quantity: 1 }],
      totalAmount: 50,
      paymentMethod: "cash",
      shippingAddress: {
        fullName: "User One",
        phone: "1234567890",
        street: "Street 123",
        city: "Kathmandu",
      },
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("confirmed");
  });
});