// Mock Firestore + Next
jest.mock('@/src/database/firebaseAdmin', () => ({
    AUTH: {
      verifyIdToken: jest.fn(),
    },
  }));
  
  jest.mock('next/headers', () => ({
    cookies: jest.fn(),
  }));
  
  // 再 import 被測試的 GET handler
  import { GET } from '@/app/api/session/route';
  import { AUTH } from '@/src/database/firebaseAdmin';
  import { cookies } from 'next/headers';
  
  describe('GET /api/session', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 401 if session cookie is missing', async () => {
      (cookies as jest.Mock).mockReturnValue({
        get: () => undefined,
      });
  
      const res = await GET();
      const data = await res.json();
  
      expect(res.status).toBe(401);
      expect(data.loggedIn).toBe(false);
    });
  
    it('should return 200 and user info if token is valid', async () => {
      (cookies as jest.Mock).mockReturnValue({
        get: () => ({ value: 'valid-token' }),
      });
  
      (AUTH.verifyIdToken as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        name: 'Test User',
      });
  
      const res = await GET();
      const data = await res.json();
  
      expect(res.status).toBe(200);
      expect(data.loggedIn).toBe(true);
      expect(data.email).toBe('test@example.com');
      expect(data.name).toBe('Test User');
    });
  
    it('should return 403 if token is invalid', async () => {
      (cookies as jest.Mock).mockReturnValue({
        get: () => ({ value: 'invalid-token' }),
      });
  
      (AUTH.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));
  
      const res = await GET();
      const data = await res.json();
  
      expect(res.status).toBe(403);
      expect(data.loggedIn).toBe(false);
    });
  });
  