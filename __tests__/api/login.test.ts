import { POST } from '@/app/api/login/route';
import { NextRequest } from 'next/server';

// mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
      headers: {
        get: (key: string) => {
          if (key === 'set-cookie') return `session=${body.token || ''}`;
          return null;
        },
      },
      cookies: {
        set: jest.fn(), // mock set cookie
      },
    }),
  },
}));

// mock Firebase Admin
jest.mock('@/src/database/firebaseAdmin', () => ({
  AUTH: {
    verifyIdToken: jest.fn(),
  },
}));
import { AUTH } from '@/src/database/firebaseAdmin';

function createMockRequest(body: any): Partial<NextRequest> {
  return {
    json: async () => body,
  };
}

describe('login API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('成功登入：應設置 cookie 並回傳 success: true', async () => {
    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'abc123' });

    const req = createMockRequest({ token: 'valid-token' });
    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(res.headers.get('set-cookie')).toContain('session=');
  });

  it('失敗登入：應回傳 401', async () => {
    (AUTH.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid'));

    const req = createMockRequest({ token: 'invalid-token' });
    const res = await POST(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });
});
