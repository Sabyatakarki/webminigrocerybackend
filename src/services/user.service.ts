import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const userRepository = new UserRepository();

export class UserService {

    async createUser(data: CreateUserDTO) {
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }

        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if (usernameCheck) {
            throw new HttpError(403, "Username already in use");
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);

        // Remove confirmPassword before saving
        const { confirmPassword, ...userData } = data;

        userData.password = hashedPassword;

        const newUser = await userRepository.createUser(userData);
        return newUser;
    }

    async loginUser(data: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const validPassword = await bcryptjs.compare(
            data.password,
            user.password
        );

        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

        // Remove password before returning user
        const { password, ...safeUser } = user.toObject();

        return {
            token,
            user: safeUser,
        };
    }
}