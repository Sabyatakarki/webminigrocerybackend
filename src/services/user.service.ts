import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { CLIENT_URL } from "../config";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/email";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) throw new HttpError(403, "Username already in use");

   
    const hashedPassword = await bcryptjs.hash(data.password, 10);

  
    const { confirmPassword, ...rest } = data;

    const userToCreate = {
      ...rest,
      password: hashedPassword,
    };

    const newUser = await userRepository.createUser(userToCreate as any);
    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(404, "User not found");

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid credentials");


    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: (user as any).fullName,
      phoneNumber: (user as any).phoneNumber,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });


    const { password, ...userWithoutPassword } = user.toObject();

    return { token, user: userWithoutPassword };
  }

  async getUserById(userId: string) {
    if (!userId) {
      throw new HttpError(400, "User ID is required");
    }
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) {
        throw new HttpError(409, "Email already exists");
      }
    }

    if (data.username && user.username !== data.username) {
      const usernameExists = await userRepository.getUserByUsername(data.username);
      if (usernameExists) {
        throw new HttpError(409, "Username already exists");
      }
    }

    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }

    const updatedUser = await userRepository.updateUser(userId, data);
    return updatedUser;
  }

  async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
          if (!token || !newPassword) {
            throw new HttpError(400, "Token and new password are required");
          }
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const userId = decoded.id;
          const hashedPassword = await bcryptjs.hash(newPassword, 10);
          const updatedUser = await userRepository.updateUser(userId, { password: hashedPassword });
          if (!updatedUser) {
            throw new HttpError(404, "User not found");
          }
          return updatedUser;
        } catch (error) {
          throw new HttpError(400, "Invalid or expired token");
        }
      }
}