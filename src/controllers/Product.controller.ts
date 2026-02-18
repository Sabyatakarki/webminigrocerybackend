import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import Product from "../models/Product.model";
import { HttpError } from "../errors/http-error";

// CREATE PRODUCT
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, quantity } = req.body;
    if (!name || !quantity) return next(new HttpError(400, "Name and quantity are required"));
    if (!req.file) return next(new HttpError(400, "Product image is required"));

    const product = await Product.create({
      name,
      quantity,
      image: req.file.filename,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// GET PRODUCTS
export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new HttpError(404, "Product not found"));

    product.name = req.body.name || product.name;
    product.quantity = req.body.quantity || product.quantity;

    // If a new image is uploaded
    if (req.file) {
      const oldImagePath = path.join(__dirname, "../../public/products", product.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); // delete old image
      product.image = req.file.filename;
    }

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new HttpError(404, "Product not found"));

    // Delete image file
    const imagePath = path.join(__dirname, "../../public/products", product.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product, message: "Product retrieved" });
  } catch (error) {
    next(error);
  }
};
