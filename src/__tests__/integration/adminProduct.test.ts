// src/__tests__/integration/product.integration.test.ts
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import ProductRouter from "../../routes/admin/adminProduct.routes";
import { connectDatabase } from "../../database/db";
import { UserModel } from "../../models/user.model";
import ProductModel from "../../models/Product.model";

const app = express();
app.use(express.json());
app.use("/api", ProductRouter);

describe("Product Integration Test", () => {
  let adminToken: string;

  beforeAll(async () => {
    // Connect to DB only if not connected
    if (mongoose.connection.readyState === 0) {
      await connectDatabase();
    }

    // Clear users
    await UserModel.deleteMany({});

    // Create admin
    const admin = await UserModel.create({
      email: "admin@test.com",
      password: "Password123!",
      username: "adminuser",
      fullName: "Admin User",
      phoneNumber: "1234567890",
      role: "admin",
    });

    // Generate JWT
    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("../../config");
    adminToken = `Bearer ${jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "1h" })}`;
  });

  beforeEach(async () => {
    // Clear products before each test
    await ProductModel.deleteMany({});
  });

  afterAll(async () => {
    // Drop database and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should fetch all products", async () => {
    await ProductModel.create({
      name: "P1",
      quantity: 5,
      price: 50,
      category: "Cat1",
      image: "img1.jpg",
    });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should get a product by id", async () => {
    const product = await ProductModel.create({
      name: "P2",
      quantity: 5,
      price: 50,
      category: "Cat2",
      image: "img2.jpg",
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("P2");
  });

  it("should delete a product", async () => {
    const product = await ProductModel.create({
      name: "P3",
      quantity: 5,
      price: 50,
      category: "Cat3",
      image: "img3.jpg",
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");
  });
});