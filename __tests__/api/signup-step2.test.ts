// ✅ mock Firestore 的 .collection().doc().update()
const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({ update: mockUpdate }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));

jest.mock('@/database/firebaseAdmin', () => ({
  DATABASE: {
    collection: mockCollection,
  },
}));

import { POST } from '@/app/api/signup/step2/route';
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

function createMockRequest(body: any): Partial<NextRequest> {
  return {
    json: async () => body,
  };
}

describe('signup step2 API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應成功更新所有欄位', async () => {
    const req = createMockRequest({
      uid: 'user123',
      nickname: '小明',
      userCommunity: '貓奴俱樂部',
      bio: 'Hello World',
      user_pf_url: 'https://example.com/image.jpg',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith('user123');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      nickname: '小明',
      userCommunity: '貓奴俱樂部',
      bio: 'Hello World',
      user_pf_url: 'https://example.com/image.jpg',
    }));
  });

  it('應成功更新部分欄位', async () => {
    const req = createMockRequest({
      uid: 'user456',
      nickname: '小花',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      nickname: '小花',
    }));
  });

  it('缺少 uid，應回傳 400', async () => {
    const req = createMockRequest({
      nickname: '沒 uid',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('缺少 uid');
  });

  it('更新失敗，應回傳 500', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Firestore 更新失敗'));

    const req = createMockRequest({
      uid: 'user789',
      nickname: '爆炸測試',
    });

    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Firestore 更新失敗');
  });
});
