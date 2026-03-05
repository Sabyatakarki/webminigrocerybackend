// email.test.ts
import nodemailer from "nodemailer";

const sendMailMock = jest.fn().mockResolvedValue({ accepted: ["test@example.com"] });

// Mock the transporter before importing sendEmail
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

import { sendEmail } from "../../config/email"; // import after mocking

describe("Email Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call transporter.sendMail with correct options", async () => {
    await sendEmail("recipient@example.com", "Subject", "<p>Hello</p>");

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: `Mero mini grocery app <${process.env.EMAIL_USER}>`,
      to: "recipient@example.com",
      subject: "Subject",
      html: "<p>Hello</p>",
    });
  });

  it("should throw if sendMail fails", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP error"));

    await expect(sendEmail("fail@example.com", "Fail", "<p>Fail</p>")).rejects.toThrow("SMTP error");
  });
});