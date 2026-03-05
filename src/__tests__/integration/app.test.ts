import app from '../../app';
import request from 'supertest';

// Mock your database connection
jest.mock('../../database/db', () => ({
  connectDatabase: jest.fn().mockResolvedValue(undefined),
}));

describe('Root API (no DB connection)', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Welcome to the API');
  });

  it('GET unknown route should return 404', async () => {
    const res = await request(app).get('/unknownroute');
    expect(res.status).toBe(404);
  });

  it('POST unknown route should return 404', async () => {
    const res = await request(app).post('/unknownroute');
    expect(res.status).toBe(404);
  });

  it('DELETE unknown route should return 404', async () => {
    const res = await request(app).delete('/unknownroute');
    expect(res.status).toBe(404);
  });
});