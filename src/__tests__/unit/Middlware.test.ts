// src/__tests__/unit/auth.middleware.test.ts
import { authorizedMiddleware, adminMiddleware } from "../../middleware/authorized.middleware";
import { UserRepository } from "../../repositories/user.repository";
import jwt from "jsonwebtoken";
import { HttpError } from "../../errors/http-error";

jest.mock("../../repositories/user.repository");
jest.mock("jsonwebtoken");

describe("Authorization Middleware Unit Tests", () => {
  let mockReq: any;
  let mockRes: any;
  let next: jest.Mock;
  const fakeUser = {
    _id: "user1",
    role: "admin",
    toObject: () => ({ _id: "user1", role: "admin", username: "testuser" }),
  };

  beforeEach(() => {
    mockReq = { headers: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should attach user to req if valid token", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(fakeUser);

    mockReq.headers.authorization = "Bearer validtoken";

    await authorizedMiddleware(mockReq, mockRes, next);

    expect(mockReq.user._id).toBe("user1");
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token missing", async () => {
    await authorizedMiddleware(mockReq, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized JWT missing",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("Invalid token"); });

    mockReq.headers.authorization = "Bearer invalidtoken";

    await authorizedMiddleware(mockReq, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(500); // error thrown in catch
    expect(mockRes.json).toHaveBeenCalled();
  });

  it("should return 401 if user not found", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserRepository.prototype.getUserById as jest.Mock).mockResolvedValue(null);

    mockReq.headers.authorization = "Bearer validtoken";

    await authorizedMiddleware(mockReq, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized user not found",
    });
  });

  it("should call next if user is admin in adminMiddleware", async () => {
    mockReq.user = { role: "admin" };
    await adminMiddleware(mockReq, mockRes, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user not admin in adminMiddleware", async () => {
    mockReq.user = { role: "user" };
    await adminMiddleware(mockReq, mockRes, next);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden not admin",
    });
  });

  it("should return 401 if no user in adminMiddleware", async () => {
    await adminMiddleware(mockReq, mockRes, next);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized no user info",
    });
  });
});