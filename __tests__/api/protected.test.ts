import { GET } from '@/app/api/protected/route';
import { AUTH } from '@/src/database/firebaseAdmin';
import { cookies as originalCookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/src/database/firebaseAdmin', () => ({
  AUTH: {
    verifyIdToken: jest.fn(),
  },
}));

describe('GET /api/protected', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token in cookie', async () => {
    (originalCookies as jest.Mock).mockResolvedValue({
      get: () => undefined,
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('should return email if token is valid', async () => {
    (originalCookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: 'valid-token' }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
      aud: '',
      auth_time: 0,
      exp: 0,
      firebase: {},
      iat: 0,
      iss: '',
      sub: '',
      uid: '',
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe('user@example.com');
  });

  it('should return 403 if token is invalid', async () => {
    (originalCookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: 'invalid-token' }),
    });

    (AUTH.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const res = await GET();
    expect(res.status).toBe(403);
  });
});
