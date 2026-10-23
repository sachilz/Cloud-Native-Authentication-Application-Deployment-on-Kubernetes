const request = require('supertest');

// Mock db module
jest.mock('../src/config/db', () => ({
  checkDbConnection: jest.fn(),
  query: jest.fn(),
  closeDb: jest.fn(),
}));

const db = require('../src/config/db');
const app = require('../src/app');

describe('Health Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 with service information when DB is connected', async () => {
      db.checkDbConnection.mockResolvedValue({ connected: true, error: null });

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBe('devops-task-tracker-backend');
      expect(res.body.database).toBe('connected');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptimeSeconds');
    });

    it('should return 200 with database disconnected when DB is down', async () => {
      db.checkDbConnection.mockResolvedValue({ connected: false, error: 'Connection refused' });

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.database).toBe('disconnected');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return 200 UP for liveness probe', async () => {
      const res = await request(app).get('/api/health/live');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return 200 READY when database is connected', async () => {
      db.checkDbConnection.mockResolvedValue({ connected: true, error: null });

      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('READY');
      expect(res.body.database).toBe('connected');
    });

    it('should return 503 NOT_READY when database is disconnected', async () => {
      db.checkDbConnection.mockResolvedValue({ connected: false, error: 'Database timeout' });

      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(503);
      expect(res.body.status).toBe('NOT_READY');
      expect(res.body.database).toBe('disconnected');
    });
  });
});
