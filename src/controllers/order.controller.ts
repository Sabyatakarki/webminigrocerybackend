import { Request, Response, NextFunction } from "express";
import Order from "../models/order.model";
import Product from "../models/Product.model";
import { HttpError } from "../errors/http-error";
import path from "path";
import fs from "fs";

// 📦 CREATE ORDER (User)
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { products } = req.body;

    // If products is a string (from FormData), parse it
    if (typeof products === "string") {
      products = JSON.parse(products);
    }

    if (!products || products.length === 0) {
      return next(new HttpError(400, "No products in order"));
    }

    let totalAmount = 0;
    let orderImagePath: string | undefined = undefined;

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const product = await Product.findById(item.product);

      if (!product) {
        return next(new HttpError(404, `Product not found: ${item.product}`));
      }

      if (product.quantity < item.quantity) {
        return next(
          new HttpError(400, `Insufficient stock for ${product.name}`)
        );
      }

      // Deduct stock
      product.quantity -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      // Use first product's image as order image
      if (i === 0 && product.image) {
        const sourcePath = path.join(__dirname, "../../public/products", product.image);
        const fileExt = path.extname(product.image);
        const fileName = `order-${Date.now()}${fileExt}`;
        const destPath = path.join(__dirname, "../../public/orders", fileName);

        // Ensure orders folder exists
        const ordersDir = path.join(__dirname, "../../public/orders");
        if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir, { recursive: true });

        // Copy the image to orders folder
        fs.copyFileSync(sourcePath, destPath);

        orderImagePath = `/uploads/orders/${fileName}`;
      }
    }

    const order = await Order.create({
      user: (req as any).user._id,
      products,
      totalAmount,
      paymentMethod: "cash",
      image: orderImagePath,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// 📦 GET MY ORDERS (User)
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: (req as any).user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// 👑 GET ALL ORDERS (Admin)
export const getAllOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// ⚡ UPDATE ORDER STATUS (Admin)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new HttpError(404, "Order not found"));
    }

    order.status = req.body.status || order.status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};