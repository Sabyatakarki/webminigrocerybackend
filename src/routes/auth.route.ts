import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { uploads } from "../middleware/upload.middleware"; // your multer setup
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const authController = new AuthController();

// Register & Login
router.post("/register", authController.register);
router.post("/login", authController.login);

// Update profile with profile picture
// 'profilePicture' is the field name sent from Flutter
// Order changed: upload first to parse form data, then auth to check token from body if needed
router.post(
  "/update-profile",
  authorizedMiddleware,         
  uploads.single("profilePicture"),
  authController.updateProfile
);




export default router;
