const request = require('supertest');

// Mock db module
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  checkDbConnection: jest.fn(),
  closeDb: jest.fn(),
}));

const db = require('../src/config/db');
const app = require('../src/app');
const { hashPassword } = require('../src/controllers/authController');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    it('should reject registration if username is too short', async () => {
      const res = await request(app).post('/api/register').send({
        username: 'ab',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 3 characters');
    });

    it('should reject registration if password is too short', async () => {
      const res = await request(app).post('/api/register').send({
        username: 'john',
        password: '12',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 4 characters');
    });

    it('should reject registration if username is already taken', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app).post('/api/register').send({
        username: 'existinguser',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already taken');
    });

    it('should register a new user successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // User check
        .mockResolvedValueOnce({
          rows: [
            {
              id: 2,
              username: 'newuser',
              email: 'newuser@example.com',
              created_at: new Date().toISOString(),
            },
          ],
        }); // Insert

      const res = await request(app).post('/api/register').send({
        username: 'newuser',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('newuser');
    });
  });

  describe('POST /api/login', () => {
    it('should reject login if credentials are missing', async () => {
      const res = await request(app).post('/api/login').send({
        username: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject login if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/login').send({
        username: 'nonexistent',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid username or password');
    });

    it('should reject login if password is wrong', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: 'admin',
            password_hash: hashPassword('correctpassword'),
          },
        ],
      });

      const res = await request(app).post('/api/login').send({
        username: 'admin',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with correct credentials', async () => {
      const password = 'mypassword123';
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 5,
            username: 'alice',
            email: 'alice@example.com',
            password_hash: hashPassword(password),
          },
        ],
      });

      const res = await request(app).post('/api/login').send({
        username: 'alice',
        password: password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('alice');
    });
  });
});
