import request from "supertest";
import express from "express";

// ✅ Mock controller functions FIRST
const mockRegister = jest.fn((req, res) => res.status(201).json({ message: "registered" }));
const mockLogin = jest.fn((req, res) => res.status(200).json({ message: "logged in" }));
const mockRequestReset = jest.fn((req, res) => res.status(200).json({ message: "reset email sent" }));
const mockResetPassword = jest.fn((req, res) => res.status(200).json({ message: "password reset" }));
const mockUpdateProfile = jest.fn((req, res) => res.status(200).json({ message: "profile updated" }));

// ✅ Mock AuthController
jest.mock("../../controllers/auth.controller", () => {
  return {
    AuthController: jest.fn().mockImplementation(() => ({
      register: mockRegister,
      login: mockLogin,
      sendResetPasswordEmail: mockRequestReset,
      resetPassword: mockResetPassword,
      updateProfile: mockUpdateProfile,
    })),
  };
});

// ✅ Mock upload middleware
jest.mock("../../middleware/upload.middleware", () => ({
  uploads: {
    profile: {
      single: () => (req: any, res: any, next: any) => next(),
    },
  },
}));

// ✅ Mock authorized middleware
jest.mock("../../middleware/authorized.middleware", () => ({
  authorizedMiddleware: (req: any, res: any, next: any) => next(),
}));

// ⬇️ Import router AFTER mocks
import authRouter from "../../routes/auth.route";

// Setup express app for testing
const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth Routes", () => {

  it("POST /auth/register", async () => {
    const res = await request(app).post("/auth/register");
    expect(res.status).toBe(201);
    expect(mockRegister).toHaveBeenCalled();
  });

  it("POST /auth/login", async () => {
    const res = await request(app).post("/auth/login");
    expect(res.status).toBe(200);
    expect(mockLogin).toHaveBeenCalled();
  });

  it("POST /auth/request-password-reset", async () => {
    const res = await request(app).post("/auth/request-password-reset");
    expect(res.status).toBe(200);
    expect(mockRequestReset).toHaveBeenCalled();
  });

  it("POST /auth/reset-password/:token", async () => {
    const res = await request(app).post("/auth/reset-password/testtoken");
    expect(res.status).toBe(200);
    expect(mockResetPassword).toHaveBeenCalled();
  });

  it("POST /auth/update-profile", async () => {
    const res = await request(app)
      .post("/auth/update-profile")
      .attach("profilePicture", Buffer.from("fake"), "test.jpg");

    expect(res.status).toBe(200);
    expect(mockUpdateProfile).toHaveBeenCalled();
  });

});