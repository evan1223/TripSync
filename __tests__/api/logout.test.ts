import { POST } from '@/app/api/logout/route';

// mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
      headers: {
        get: (key: string) => {
          if (key === 'set-cookie') return 'session=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          return null;
        },
      },
      cookies: {
        set: jest.fn(), // 觀察 cookies.set 是否被呼叫
      },
    }),
  },
}));

import { NextResponse } from 'next/server';

describe('logout API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應清除 session cookie 並回傳 success: true', async () => {
    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);                         // 回傳狀態碼
    expect(data.success).toBe(true);                      // 回傳 JSON

    // 確認 cookies.set 有被呼叫一次
    expect(res.cookies.set).toHaveBeenCalledTimes(1);

    // 確認 set 的參數為清除 session cookie
    expect(res.cookies.set).toHaveBeenCalledWith(
      'session',
      '',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        expires: new Date(0),
      })
    );
  });
});
