import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

export class UserService {

  async createUser(data: CreateUserDTO) {
    const existingEmail = await userRepository.getUserByEmail(data.email);
    if (existingEmail) {
      throw new HttpError(403, "Email already exists");
    }

    const existingUsername = await userRepository.getUserByUsername(data.username);
    if (existingUsername) {
      throw new HttpError(403, "Username already exists");
    }

    const encryptedPassword = await bcryptjs.hash(data.password, 10);

    const userPayload = {
      ...data,
      password: encryptedPassword,
    };

    delete (userPayload as any).confirmPassword;

    return await userRepository.createUser(userPayload);
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "Invalid email or password");
    }

    const passwordMatch = await bcryptjs.compare(
      data.password,
      user.password
    );

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

    return {
      token,
      user: userData,
    };
  }
}
