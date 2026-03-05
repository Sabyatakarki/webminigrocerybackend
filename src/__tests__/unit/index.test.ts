// src/__tests__/unit/config.test.ts
import * as config from "../../config";

describe("Config Module", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // clear cache
    process.env = { ...OLD_ENV }; // reset env
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore env
  });

  it("should set CLIENT_URL from env", () => {
    process.env.CLIENT_URL = "https://example.com";
    const { CLIENT_URL } = require("../../config");
    expect(CLIENT_URL).toBe("https://example.com");
  });

  it("should fallback CLIENT_URL if env not set", () => {
    delete process.env.CLIENT_URL;
    const { CLIENT_URL } = require("../../config");
    expect(CLIENT_URL).toBe("http://localhost:3000");
  });

  it("should set PORT from env as number", () => {
    process.env.PORT = "1234";
    const { PORT } = require("../../config");
    expect(PORT).toBe(1234);
  });

  it("should fallback PORT if env not set", () => {
    delete process.env.PORT;
    const { PORT } = require("../../config");
    expect(PORT).toBe(5000);
  });

  it("should set MONGO_URI from env", () => {
    process.env.MONGO_URI = "mongodb://custom:27017/test";
    const { MONGO_URI } = require("../../config");
    expect(MONGO_URI).toBe("mongodb://custom:27017/test");
  });

  it("should fallback MONGO_URI if env not set", () => {
    delete process.env.MONGO_URI;
    const { MONGO_URI } = require("../../config");
    expect(MONGO_URI).toBe("mongodb+srv://sabyatakarki05_db_user:qb3Ujciu3ojSf6IX@cluster0.hr21tk2.mongodb.net/Minigrocery_backend");
  });

  it("should set JWT_SECRET from env", () => {
    process.env.JWT_SECRET = "merosecret";
    const { JWT_SECRET } = require("../../config");
    expect(JWT_SECRET).toBe("merosecret");
  });

  it("should fallback JWT_SECRET if env not set", () => {
    delete process.env.JWT_SECRET;
    const { JWT_SECRET } = require("../../config");
    expect(JWT_SECRET).toBe("merosecret");
  });
});