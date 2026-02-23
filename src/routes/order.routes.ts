import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";

import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middleware/authorized.middleware";

import { uploads } from "../middleware/upload.middleware";

const router = express.Router();

router.use(authorizedMiddleware);

router.post(
  "/",
  uploads.orders.single("image"), 
  createOrder
);

router.get("/my", getMyOrders);

router.get("/", adminMiddleware, getAllOrders);

router.put("/:id", adminMiddleware, updateOrderStatus);

export default router;