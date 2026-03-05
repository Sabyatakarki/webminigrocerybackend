// src/__tests__/unit/user.repository.test.ts
import { UserRepository } from "../../repositories/user.repository";
import { UserModel } from "../../models/user.model";

jest.mock("../../models/user.model");

describe("UserRepository Unit Tests", () => {
  let userRepo: UserRepository;
  const fakeUser = {
    _id: "user1",
    email: "test@example.com",
    username: "testuser",
    fullName: "Test User",
    phoneNumber: "1234567890",
    password: "hashedPassword",
    toObject: () => ({ _id: "user1", username: "testuser" }),
  };

  beforeEach(() => {
    userRepo = new UserRepository();
    jest.clearAllMocks();
  });

  it("createUser should save and return user", async () => {
    (UserModel as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(fakeUser),
    }));

    const result = await userRepo.createUser({ email: "test@example.com" });
    expect(result).toEqual(fakeUser);
  });

  it("getUserByEmail should return a user", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);

    const result = await userRepo.getUserByEmail("test@example.com");
    expect(result).toEqual(fakeUser);
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("getUserByUsername should return a user", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);

    const result = await userRepo.getUserByUsername("testuser");
    expect(result).toEqual(fakeUser);
    expect(UserModel.findOne).toHaveBeenCalledWith({ username: "testuser" });
  });

  it("getUserById should return a user", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);

    const result = await userRepo.getUserById("user1");
    expect(result).toEqual(fakeUser);
    expect(UserModel.findById).toHaveBeenCalledWith("user1");
  });

  it("updateUser should return updated user", async () => {
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...fakeUser, username: "updated" });

    const result = await userRepo.updateUser("user1", { username: "updated" });

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", { username: "updated" }, { new: true });
  });

  it("deleteUser should return true if user deleted", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(fakeUser);

    const result = await userRepo.deleteUser("user1");
    expect(result).toBe(true);
    expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("user1");
  });

  it("getAllUsers should return users and total count", async () => {
    const usersArray = [fakeUser, fakeUser];
    (UserModel.find as any).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(usersArray),
    });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(2);

    const result = await userRepo.getAllUsers(1, 10, "test");
    expect(result.users).toEqual(usersArray);
    expect(result.total).toBe(2);
  });
});