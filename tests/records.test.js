const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./testSetup");

let adminToken, viewerToken, analystToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_key";
  process.env.JWT_EXPIRES_IN = "1d";
  await connectTestDB();
});

afterAll(async () => await closeTestDB());

beforeEach(async () => {
  await clearTestDB();

  // Create admin
  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });
  adminToken = adminRes.body.data.token;

  // Create viewer
  const viewerRes = await request(app).post("/api/auth/register").send({
    name: "Viewer User",
    email: "viewer@example.com",
    password: "password123",
    role: "viewer",
  });
  viewerToken = viewerRes.body.data.token;

  // Create analyst
  const analystRes = await request(app).post("/api/auth/register").send({
    name: "Analyst User",
    email: "analyst@example.com",
    password: "password123",
    role: "analyst",
  });
  analystToken = analystRes.body.data.token;
});

describe("POST /api/records", () => {
  it("should allow admin to create a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 5000,
        type: "income",
        category: "Salary",
        date: "2024-03-01",
        notes: "March salary",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(5000);
    expect(res.body.data.type).toBe("income");
  });

  it("should deny viewer from creating a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ amount: 100, type: "expense", category: "Food" });

    expect(res.statusCode).toBe(403);
  });

  it("should deny analyst from creating a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({ amount: 100, type: "expense", category: "Food" });

    expect(res.statusCode).toBe(403);
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 500 }); // missing type and category

    expect(res.statusCode).toBe(400);
  });

  it("should return 400 for invalid amount", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: -100, type: "expense", category: "Food" });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/records", () => {
  beforeEach(async () => {
    // Seed some records
    await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 10000, type: "income", category: "Salary", date: "2024-01-15" });

    await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 2000, type: "expense", category: "Food", date: "2024-01-20" });
  });

  it("should allow all roles to view records", async () => {
    for (const token of [adminToken, viewerToken, analystToken]) {
      const res = await request(app)
        .get("/api/records")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.records.length).toBe(2);
    }
  });

  it("should filter records by type", async () => {
    const res = await request(app)
      .get("/api/records?type=income")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.records.every((r) => r.type === "income")).toBe(true);
  });

  it("should support pagination", async () => {
    const res = await request(app)
      .get("/api/records?page=1&limit=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.records.length).toBe(1);
    expect(res.body.data.pages).toBe(2);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/records");
    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /api/records/:id (soft delete)", () => {
  it("should soft delete a record and hide it from list", async () => {
    const createRes = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 500, type: "expense", category: "Travel" });

    const recordId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toBe(200);

    // Verify it no longer appears in list
    const listRes = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${adminToken}`);

    const ids = listRes.body.data.records.map((r) => r._id);
    expect(ids).not.toContain(recordId);
  });
});
