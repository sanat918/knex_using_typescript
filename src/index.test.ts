import request from "supertest";
import { createApp } from "../src/index";
import express from "express";

let app: express.Application;
beforeAll(() => {
  app = createApp(3001);
});

describe("Test demo API", () => {
  test("get the 1st demo data", async () => {
    const res = await request(app).get("/rest/demo/1");
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      data: [{ id: 1, firstName: "John", lastName: "Doe", gender: "male" }],
    });
  });
});

describe("POST /rest/user", () => {
  test("should create a new user", async () => {
    const newUser = {
      givenName: "John",
      familyName: "Doe",
      gender: "Male",
    };

    const res = await request(app).post("/rest/user").send(newUser);

    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty("success", true);
  });

  test("should return 409 if user already exists", async () => {
    const existingUser = {
      givenName: "John",
      familyName: "Doe",
      gender: "Male",
    };

    const res = await request(app).post("/rest/user").send(existingUser);

    expect(res.status).toEqual(409);
    expect(res.body).toHaveProperty("message", "User already exists");
  });
});

describe("PATCH /rest/user/:id", () => {
  it("should update user details", async () => {
    const userId = 1; // Provide an existing user ID
    const updatedUser = {
      givenName: "Updated John",
      familyName: "Updated Doe",
      gender: "Other",
    };

    const res = await request(app)
      .patch(`/rest/user/${userId}`)
      .send(updatedUser);

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("message", "User details updated");
  });

  test("should return 404 if user ID does not exist for update", async () => {
    const nonExistentUserId = 999; // Provide a non-existent user ID
    const updatedUser = {
      givenName: "Updated John",
      familyName: "Updated Doe",
      gender: "Other",
    };

    const res = await request(app)
      .patch(`/rest/user/${nonExistentUserId}`)
      .send(updatedUser);

    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  it("should return 400 if no fields are provided for update", async () => {
    const userId = 1; // Provide an existing user ID

    const res = await request(app).patch(`/rest/user/${userId}`).send({}); // Empty update object

    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty(
      "error",
      "Please provide at least one field to update",
    );
  });
});

describe("GET /rest/user", () => {
  it("should retrieve a list of users", async () => {
    const res = await request(app).get("/rest/user");

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should return 404 if no users are found", async () => {
    // Assuming no users are available
    const res = await request(app).get("/rest/user");

    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty("message", "User List is Empty");
  });
});

describe("DELETE /rest/user/:id", () => {
  it("should delete a user", async () => {
    const userId = 1; // Provide an existing user ID to delete

    const res = await request(app).delete(`/rest/user/${userId}`);

    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("message", "User deleted");
  });

  it("should return 404 if user ID does not exist for deletion", async () => {
    const nonExistentUserId = 999; // Provide a non-existent user ID

    const res = await request(app).delete(`/rest/user/${nonExistentUserId}`);

    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });
});
