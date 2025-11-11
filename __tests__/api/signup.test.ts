// ✅ Mock Firestore 鏈式 API：collection → doc → set
const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));

jest.mock('@/database/firebaseAdmin', () => ({
  AUTH: {
    createUser: jest.fn(),
  },
  DATABASE: {
    collection: mockCollection,
  },
}));

import { POST } from '@/app/api/signup/route';
import { NextRequest } from 'next/server';

// ✅ Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

// ✅ 匯入 AUTH 以控制 createUser 回傳
import { AUTH } from '@/database/firebaseAdmin';

// ✅ 建立假的 NextRequest
function createMockRequest(body: any): Partial<NextRequest> {
  return {
    json: async () => body,
  };
}

describe('signup API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('成功註冊：回傳 uid', async () => {
    (AUTH.createUser as jest.Mock).mockResolvedValue({ uid: 'user123' });

    const req = createMockRequest({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'securepassword',
      gender: 'female',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.uid).toBe('user123');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith('user123');
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Alice',
      email: 'alice@example.com',
      gender: 'female',
    }));
  });

  it('失敗註冊：信箱已存在', async () => {
    (AUTH.createUser as jest.Mock).mockRejectedValue({ code: 'auth/email-already-exists' });

    const req = createMockRequest({
      name: 'Bob',
      email: 'bob@example.com',
      password: '12345678',
      gender: 'male',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.errCode).toBe('email-exists');
    expect(data.error).toBe('此信箱已註冊，請使用其他信箱');
  });

  it('失敗註冊：未知錯誤', async () => {
    (AUTH.createUser as jest.Mock).mockRejectedValue(new Error('Something bad happened'));

    const req = createMockRequest({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'abc123',
      gender: 'other',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.errCode).toBe('unknown');
    expect(data.error).toBe('註冊失敗');
  });

  it('失敗註冊：createUser 回傳 undefined uid', async () => {
    (AUTH.createUser as jest.Mock).mockResolvedValue({ uid: undefined });

    const req = createMockRequest({
      name: 'NoUidUser',
      email: 'nouid@example.com',
      password: '123456',
      gender: 'unknown',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    // 若你的 route.tsx 沒寫防呆，這邊會爆錯
    expect(res.status).toBe(400);
    expect(data.error).toBe('註冊失敗');
  });

  it('失敗註冊：Firestore 寫入錯誤', async () => {
    (AUTH.createUser as jest.Mock).mockResolvedValue({ uid: 'user999' });
    mockSet.mockRejectedValue(new Error('Firestore 寫入失敗'));

    const req = createMockRequest({
      name: 'BadDB',
      email: 'bad@example.com',
      password: '123123123',
      gender: 'male',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('註冊失敗');
  });
});
