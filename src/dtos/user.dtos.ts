import z from "zod";
import { UserSchema } from "../types/user.types";

/**
 * CREATE USER DTO
 * Used for Register API
 * confirmPassword is NOT handled in backend
 */
export const CreateUserDTO = UserSchema.pick({

  username:true,
  email: true,
  password: true,
  imageUrl:true
      

});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

/**
 * LOGIN USER DTO
 * Used for Login API
 */
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
