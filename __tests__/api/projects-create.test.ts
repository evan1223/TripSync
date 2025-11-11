import { POST } from '@/app/api/projects/create/route';
import { NextRequest } from 'next/server';

// ========================
// Mock Setup
// ========================
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
let idCounter = 0;

jest.mock('@/database/firebaseAdmin', () => {
  const mockDocRef = {
    id: 'existing-project-id',
    ref: { update: mockUpdate },
  };

  const mockGet = jest.fn().mockResolvedValue({
    empty: true, // Change to false to simulate update flow
    docs: [mockDocRef],
  });

  const mockCollection = jest.fn((collectionName) => {
    if (collectionName === 'projects') {
      return {
        where: () => ({
          where: () => ({
            limit: () => ({
              get: mockGet,
            }),
          }),
        }),
        add: mockAdd,
      };
    }

    return {
      add: mockAdd,
    };
  });

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
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

import { AUTH } from '@/database/firebaseAdmin';
import { cookies } from 'next/headers';

function createMockRequest(body: any): Partial<NextRequest> {
  return {
    json: async () => body,
  };
}

describe('POST /api/projects/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0;
    mockAdd.mockImplementation(() => ({
      id: `mock-id-${++idCounter}`,
    }));
  });

  it('should return 401 if no token', async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => undefined,
    });

    const req = createMockRequest({});
    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.loggedIn).toBe(false);
  });

  it('should create a new project and return projectId', async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: 'valid-token' }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user123',
    });

    const req = createMockRequest({
      projectTypeName: 'AI',
      skillTypeNames: ['React', 'Node.js'],
      projectName: 'New Project',
      projectDescription: 'This is a test project.',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      peopleRequired: '5',
      skillDescription: 'Web dev',
      projectImageUrl: 'http://image.com/image.jpg',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.projectId).toBe('mock-id-4'); // 1 for type + 2 for skills + 1 for project
    expect(mockAdd).toHaveBeenCalledTimes(4);
  });

  it('should return 500 if Firestore throws error', async () => {
    (cookies as jest.Mock).mockReturnValue({
      get: () => ({ value: 'valid-token' }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user123',
    });

    mockAdd.mockRejectedValue(new Error('Firestore 寫入錯誤'));

    const req = createMockRequest({
      projectTypeName: 'AI',
      skillTypeNames: ['React'],
      projectName: 'Error Project',
      projectDescription: 'Error flow test',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      peopleRequired: '5',
      skillDescription: 'Test',
      projectImageUrl: '',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Firestore 寫入錯誤');
  });
});
