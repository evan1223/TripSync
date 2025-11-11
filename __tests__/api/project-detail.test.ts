import { GET } from '@/app/api/projects/[projectId]/route';
import { DATABASE } from '@/src/database/firebaseAdmin';

// Mock Firestore document.get().data()
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));
jest.mock('@/src/database/firebaseAdmin', () => ({
  DATABASE: {
    collection: jest.fn()
  }
}));

describe('GET /api/projects/[projectId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (DATABASE.collection as jest.Mock).mockImplementation(mockCollection);
  });

  it('should return project detail if project exists', async () => {
    const projectId = 'proj001';

    const mockProjectData = {
      projectName: 'AI Assistant',
      projectDescription: 'Build a helpful AI',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      peopleRequired: 3,
      skillDescription: 'Python, ML',
      projectImageUrl: 'http://example.com/image.png',
      ownerId: 'user123',
      projectTypeId: 'type456',
      skillTypeId: ['skill789', 'skill101'],
      status: 'open',
    };

    const userDocData = { name: 'Alice', email: 'alice@example.com' };
    const typeDocData = { projectTypeName: 'AI Project' };
    const skillDocs = [
      { exists: true, data: () => ({ skillTypeName: 'Python' }) },
      { exists: true, data: () => ({ skillTypeName: 'Machine Learning' }) }
    ];

    // 對不同 .doc().get() 給不同回應
    mockGet
      .mockResolvedValueOnce({ exists: true, data: () => mockProjectData }) // project
      .mockResolvedValueOnce({ exists: true, data: () => userDocData })     // owner
      .mockResolvedValueOnce({ exists: true, data: () => typeDocData })     // projectType
      .mockResolvedValueOnce(skillDocs[0])                                  // skill1
      .mockResolvedValueOnce(skillDocs[1]);                                 // skill2

    const res = await GET({} as Request, { params: { projectId } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.projectName).toBe('AI Assistant');
    expect(data.data.ownerName).toBe('Alice');
    expect(data.data.projectTypeName).toBe('AI Project');
    expect(data.data.skillTypeNames).toEqual(['Python', 'Machine Learning']);
  });

  it('should return 404 if project not found', async () => {
    mockGet.mockResolvedValueOnce({ exists: false });

    const res = await GET({} as Request, { params: { projectId: 'fake-id' } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('找不到專案');
  });

  it('should return 400 if projectId is missing', async () => {
    const res = await GET({} as Request, { params: { projectId: '' } });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('缺少 projectId');
  });

  it('should return 500 on Firestore error', async () => {
    mockGet.mockRejectedValueOnce(new Error('Firestore error'));

    const res = await GET({} as Request, { params: { projectId: 'proj-error' } });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('伺服器錯誤');
  });
});
