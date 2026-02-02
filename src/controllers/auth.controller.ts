import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dtos";
import { Request, Response } from "express";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          errors: parsedData.error.flatten(),
        });
      }

      const newUser = await userService.createUser(parsedData.data);
      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          errors: parsedData.error.flatten(),
        });
      }

      const { token, user } = await userService.loginUser(parsedData.data);
      return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token
      },
    });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
async updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Optional text fields
    const { fullName, email, phone } = req.body;

    // Multer file path
    let profilePicturePath: string | undefined;
    if (req.file) {
      profilePicturePath = `/public/profile_pictures/${req.file.filename}`;
    }

    // Validate that at least one field is being updated
    if (!fullName && !email && !phone && !profilePicturePath) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update. Provide at least one field.",
      });
    }

    // Update user in DB via service
    const updatedUser = await userService.updateUserProfile({
      userId,
      fullName,
      email,
      phone,
      profilePicture: profilePicturePath,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
}
