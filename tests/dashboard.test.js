const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./testSetup");

let adminToken, analystToken, viewerToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_key";
  process.env.JWT_EXPIRES_IN = "1d";
  await connectTestDB();
});

afterAll(async () => await closeTestDB());

beforeEach(async () => {
  await clearTestDB();

  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin", email: "admin@example.com", password: "pass123", role: "admin",
  });
  adminToken = adminRes.body.data.token;

  const analystRes = await request(app).post("/api/auth/register").send({
    name: "Analyst", email: "analyst@example.com", password: "pass123", role: "analyst",
  });
  analystToken = analystRes.body.data.token;

  const viewerRes = await request(app).post("/api/auth/register").send({
    name: "Viewer", email: "viewer@example.com", password: "pass123", role: "viewer",
  });
  viewerToken = viewerRes.body.data.token;

  // Seed records
  await request(app).post("/api/records").set("Authorization", `Bearer ${adminToken}`)
    .send({ amount: 50000, type: "income", category: "Salary", date: "2024-03-01" });

  await request(app).post("/api/records").set("Authorization", `Bearer ${adminToken}`)
    .send({ amount: 20000, type: "income", category: "Freelance", date: "2024-03-15" });

  await request(app).post("/api/records").set("Authorization", `Bearer ${adminToken}`)
    .send({ amount: 8000, type: "expense", category: "Food", date: "2024-03-10" });

  await request(app).post("/api/records").set("Authorization", `Bearer ${adminToken}`)
    .send({ amount: 3000, type: "expense", category: "Transport", date: "2024-03-20" });
});

describe("GET /api/dashboard/summary", () => {
  it("should return correct financial summary for admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalIncome).toBe(70000);
    expect(res.body.data.totalExpenses).toBe(11000);
    expect(res.body.data.netBalance).toBe(59000);
  });

  it("should allow analyst to access summary", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should deny viewer from accessing summary", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe("GET /api/dashboard/categories", () => {
  it("should return category breakdown", async () => {
    const res = await request(app)
      .get("/api/dashboard/categories")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("category");
    expect(res.body.data[0]).toHaveProperty("total");
  });
});

describe("GET /api/dashboard/trends", () => {
  it("should return monthly trends", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends?months=6")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return 400 for invalid months param", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends?months=100")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/dashboard/recent", () => {
  it("should return recent activity", async () => {
    const res = await request(app)
      .get("/api/dashboard/recent?limit=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });
});
