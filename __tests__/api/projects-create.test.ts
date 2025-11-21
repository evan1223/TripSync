import { POST } from "@/app/api/projects/create/route";
import { NextRequest } from "next/server";

// ========================
// Mock Setup
// ========================
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockGetProjects = jest.fn();
const mockGetProjectTypes = jest.fn();

let idCounter = 0;

const mockDocRef = {
  id: "existing-project-id",
  ref: { update: mockUpdate },
};

jest.mock("@/src/database/firebaseAdmin", () => {
  const mockCollection = (collectionName: string) => {
    if (collectionName === "projects") {
      // 專案集合：先查是否已存在同名 + 同 owner 的專案
      return {
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: mockGetProjects,
            })),
          })),
        })),
        add: mockAdd,
      };
    }

    if (collectionName === "projectTypes") {
      // projectTypes：根據地點名稱查有沒有存在的 type
      return {
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: mockGetProjectTypes,
          })),
        })),
        add: mockAdd,
      };
    }

    if (collectionName === "skillTypes") {
      // skillTypes：直接 add
      return {
        add: mockAdd,
      };
    }

    // 其他 collection（通常不會用到）
    return {
      add: mockAdd,
    };
  };

  return {
    AUTH: {
      verifyIdToken: jest.fn(),
    },
    DATABASE: {
      collection: mockCollection,
    },
  };
});

// ========================
// Mock cookies()
// ========================
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { AUTH } from "@/src/database/firebaseAdmin";
import { cookies } from "next/headers";

function createMockRequest(body: any): Partial<NextRequest> {
  return {
    json: async () => body,
  };
}

describe("POST /api/projects/create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0;

    // 每次 add 都會回傳一個新的 id
    mockAdd.mockImplementation(() => ({
      id: `mock-id-${++idCounter}`,
    }));

    // 預設：查專案 / projectTypes 都查不到 →「新專案」情境
    mockGetProjects.mockResolvedValue({
      empty: true,
      docs: [],
    });

    mockGetProjectTypes.mockResolvedValue({
      empty: true,
      docs: [],
    });
  });

  it("should return 401 if no token", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => undefined,
    });

    const req = createMockRequest({});
    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.loggedIn).toBe(false);
  });

  it("should create a new project (with locations / skills / budgetItems) and return projectId", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "valid-token" }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user123",
    });

    // 專案不存在 → 新增 flow
    mockGetProjects.mockResolvedValue({
      empty: true,
      docs: [],
    });

    // projectTypes 也不存在 → 每個地點都要新增一筆 type
    mockGetProjectTypes.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const req = createMockRequest({
      projectName: "New Project",
      projectTypeName: "Japan", // 會變成 locations: ["Japan"]
      // 也可以直接傳 locations: ["Japan"]，API 會優先用 body.locations
      skillTypeNames: ["React", "Node.js"],
      projectDescription: "This is a test project.",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      peopleRequired: "5",
      skillDescription: "Web dev",
      projectImageUrl: "http://image.com/image.jpg",
      budgetItems: [
        { label: "住宿", amount: "1000" },
        { label: "交通", amount: "500" },
        { label: "  ", amount: "" }, // 應該會被 filter 掉
      ],
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.created).toBe(true);
    expect(data.projectId).toBe("mock-id-4"); // 1(projectTypes) + 2(skillTypes) + 1(project)

    // add 被呼叫次數：1 projectTypes + 2 skillTypes + 1 project = 4
    expect(mockAdd).toHaveBeenCalledTimes(4);

    // 最後一次 add 應該是建立 projects
    const lastAddCallArgs = mockAdd.mock.calls[mockAdd.mock.calls.length - 1][0];

    expect(lastAddCallArgs).toEqual(
      expect.objectContaining({
        projectName: "New Project",
        ownerId: "user123",
        locations: ["Japan"],
        status: "open",
        budgetItems: [
          { label: "住宿", amount: 1000 },
          { label: "交通", amount: 500 },
        ],
      })
    );
  });

  it("should update existing project if same projectName and ownerId found", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "valid-token" }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user123",
    });

    // 專案已存在 → 走更新 flow
    mockGetProjects.mockResolvedValue({
      empty: false,
      docs: [mockDocRef],
    });

    const req = createMockRequest({
      projectName: "Existing Project",
      projectTypeName: "Taiwan / Taipei",
      projectDescription: "Updated description",
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      peopleRequired: "3",
      skillDescription: "Updated skill",
      projectImageUrl: "http://image.com/new.jpg",
      budgetItems: [
        { label: "餐飲", amount: "800" },
        { label: "住宿", amount: "1200" },
      ],
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.updated).toBe(true);
    expect(data.projectId).toBe("existing-project-id");

    // 更新應該呼叫一次
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // 確認更新內容（特別是 locations / budgetItems）
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        projectDescription: "Updated description",
        peopleRequired: 3,
        status: "open",
        projectTypeName: "Taiwan / Taipei",
        locations: ["Taiwan", "Taipei"],
        budgetItems: [
          { label: "餐飲", amount: 800 },
          { label: "住宿", amount: 1200 },
        ],
      })
    );

    // 更新 flow 不會新增任何東西
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it("should return 500 if Firestore throws error", async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: "valid-token" }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: "user123",
    });

    // 專案不存在 → 會走新增 flow
    mockGetProjects.mockResolvedValue({
      empty: true,
      docs: [],
    });

    mockGetProjectTypes.mockResolvedValue({
      empty: true,
      docs: [],
    });

    // 一旦呼叫 add 就拋錯
    mockAdd.mockRejectedValue(new Error("Firestore 寫入錯誤"));

    const req = createMockRequest({
      projectName: "Error Project",
      projectTypeName: "AI",
      projectDescription: "Error flow test",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      peopleRequired: "5",
      skillDescription: "Test",
      projectImageUrl: "",
      skillTypeNames: ["React"],
      budgetItems: [{ label: "測試", amount: "100" }],
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Firestore 寫入錯誤");
  });
});
