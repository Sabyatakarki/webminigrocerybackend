// Existing imports
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";

//For profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/profile_pictures");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `pro-pic-${fileSuffix}${ext}`);
  }
});

//for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/products");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `product-${fileSuffix}${ext}`);
  }
});

//for orders
const orderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/orders");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `order-${fileSuffix}${ext}`);
  }
});



const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new HttpError(400, "Invalid file type, only images are allowed!"));
  }
};

// --- Multer Instances ---
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const orderUpload = multer({
  storage: orderStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// --- Export helpers ---
export const uploads = {
  profile: {
    single: (fieldName: string) => profileUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => profileUpload.array(fieldName, maxCount),
  },
  product: {
    single: (fieldName: string) => productUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => productUpload.array(fieldName, maxCount),
  },
  orders:{
    single: (fieldName: string) => orderUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => orderUpload.array(fieldName, maxCount),
  }

};
