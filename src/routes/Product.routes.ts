import express from "express";
import { getProducts, createProduct } from "../controllers/Product.controller";
import { uploads } from "../middleware/upload.middleware";

const router = express.Router();

// GET all products
router.get("/", getProducts);

// POST create product
router.post(
  "/",
  uploads.product.single("image"), // <-- use product namespace here
  createProduct
);

export default router;
