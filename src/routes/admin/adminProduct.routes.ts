import express from "express";
import { authorizedMiddleware, adminMiddleware } from "../../middleware/authorized.middleware";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "../../controllers/Product.controller";
import { uploads } from "../../middleware/upload.middleware";

const router = express.Router();

// Protect all admin routes
router.use(authorizedMiddleware);
router.use(adminMiddleware);

// CRUD
router.get("/products", getProducts); // view all products
router.get("/products/:id", getProductById); // view single product 
router.post("/products", uploads.product.single("image"), createProduct); // add
router.put("/products/:id", uploads.product.single("image"), updateProduct); // edit
router.delete("/products/:id", deleteProduct); // delete

export default router;
