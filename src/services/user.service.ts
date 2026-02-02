import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

export class UserService {
  // Create a new user
  async createUser(data: CreateUserDTO) {
    const existingEmail = await userRepository.getUserByEmail(data.email);
    if (existingEmail) {
      throw new HttpError(403, "Email already exists");
    }

    const encryptedPassword = await bcryptjs.hash(data.password, 10);

    const userPayload = {
      ...data,
      password: encryptedPassword,
    };

    // Remove confirmPassword before saving
    delete (userPayload as any).confirmPassword;

    const newUser = await userRepository.createUser(userPayload);
    return newUser;
  }

  // Login user
  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "Invalid email or password");
    }

    const passwordMatch = await bcryptjs.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return { token, user: userData };
  }

  // Update profile including optional profile picture
  async updateUserProfile(data: {
    userId: string;
    fullName?: string;
    email?: string;
    phone?: string;
    profilePicture?: string; // path in public folder
  }) {
    const existingUser = await userRepository.getUserById(data.userId);
    if (!existingUser) {
      throw new HttpError(404, "User not found");
    }

    if (data.email !== undefined) existingUser.email = data.email;
    if (data.profilePicture !== undefined)
      existingUser.imageUrl = data.profilePicture;

    await userRepository.updateUser(data.userId, existingUser);

    const updatedUser = existingUser.toObject();
    delete updatedUser.password;

    return updatedUser;
  }
}
