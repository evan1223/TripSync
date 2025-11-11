import { GET } from "@/app/api/launchProjects/route";
import { AUTH, DATABASE } from "@/src/database/firebaseAdmin";

// 模擬 Firebase ADMIN SDK
jest.mock("@/src/database/firebaseAdmin", () => ({
  AUTH: {
    verifyIdToken: jest.fn(),
  },
  DATABASE: {
    collection: jest.fn(),
  },
}));

// 模擬 Firestore 的回傳結構
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet }));
const mockWhere = jest.fn(() => ({ get: mockGet }));
const mockCollection = jest.fn((name: string) => {
  switch (name) {
    case "projects":
      return { where: mockWhere };
    case "skillTypes":
    case "users":
      return { doc: mockDoc };
    default:
      return {};
  }
});

(DATABASE.collection as jest.Mock).mockImplementation(mockCollection);

describe("GET /api/launchProjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no token provided", async () => {
    const req = {
      headers: {
        get: () => null,
      },
    } as any;

    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("should return projects with details if token is valid", async () => {
    // 假設驗證成功
    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({ uid: "user-123" });

    // 模擬 Firestore 專案查詢
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          data: () => ({
            id: "mock-project-id",
            startDate: {
              toDate: () => new Date("2024-01-01"),
            },
            endDate: {
              toDate: () => new Date("2024-12-31"),
            },
            skillTypeId: ["s1", "s2"],
            ownerId: "user-123",
            projectName: "AI Companion",
            projectDescription: "A smart assistant app",
          }),
        },
      ],
    });

    // 模擬查詢技術與使用者資料
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: "Alice" }) }); // users
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ skillTypeName: "React" }) }); // skillType s1
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ skillTypeName: "Node.js" }) }); // skillType s2

    const req = {
      headers: {
        get: () => "Bearer valid.token",
      },
    } as any;

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].projectName).toBe("AI Companion");
    expect(data[0].skillTypeName).toContain("React");
    expect(data[0].ownerName).toBe("Alice");
  });
});
