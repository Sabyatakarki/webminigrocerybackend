import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe(
    "Authenciation Integration Test", //name of test suite/group
    () => {//what to fo in test
        const testUser = {
            username:"testUser",
            email:"testUser@gmail.com",
            password:"test12345",
            confirmPassword:"test@12345",
            firstname:"test",
            lastname:"user"
        };
         beforeAll(async () => {
            // Clean up test user if exists
            await UserModel.deleteOne({ email: testUser.email });
        });
        afterAll(async () => {
            // Clean up test user after tests
            await UserModel.deleteOne({ email: testUser.email });
        });

        describe(
            "POST /api/auth/register", // nested test suite/group
            () => {
                test(
                    "should register a new user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send(testUser)
                        
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty(
                            "message", 
                            "User registered successfully"
                        );
                    }
                )
            }
        )
    }
)