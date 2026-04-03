const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./testSetup");

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_key";
  process.env.JWT_EXPIRES_IN = "1d";
  await connectTestDB();
});

afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "viewer",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.user.role).toBe("viewer");
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should return 409 for duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First User",
      email: "duplicate@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "duplicate@example.com",
      password: "password456",
    });

    expect(res.statusCode).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email: "login@example.com",
      password: "password123",
      role: "admin",
    });
  });

  it("should login successfully and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user when authenticated", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Me User",
      email: "me@example.com",
      password: "password123",
      role: "analyst",
    });

    const token = registerRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("me@example.com");
    expect(res.body.data.role).toBe("analyst");
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
