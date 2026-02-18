import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.services";
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dtos";

let adminUserService = new AdminUserService();

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
          errors: parsedData.error.flatten(),
        });
      }

      // image optional (keep your existing folder path if different)
      if (req.file) {
        (parsedData.data as any).imageUrl = `/uploads/profile_picture/${req.file.filename}`;
      }

      const newUser = await adminUserService.createUser(parsedData.data);

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

  //PAGINATED GET ALL 
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size, search } = req.query as {
        page?: string;
        size?: string;
        search?: string;
      };

      const { users, pagination } = await adminUserService.getAllUsers(
        page,
        size,
        search
      );

      return res.status(200).json({
        success: true,
        data: users,
        pagination,
        message: "All Users Retrieved",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
          errors: parsedData.error.flatten(),
        });
      }

      // image optional (keep your existing folder path if different)
      if (req.file) {
        (parsedData.data as any).imageUrl = `/uploads/profile_picture/${req.file.filename}`;
      }

      const updatedUser = await adminUserService.updateUser(userId, parsedData.data);

      return res.status(200).json({
        success: true,
        message: "User Updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;

      const deleted = await adminUserService.deleteUser(userId);

      // your service already throws 404 if not found,
      // but keeping this check is okay too
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User Deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;

      const user = await adminUserService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
        message: "Single User Retrieved",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  
}
