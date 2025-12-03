const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

describe('Users API', () => {
  let createdUser;

  beforeEach(async () => {
    await User.deleteMany({});
    await ActivityLog.deleteMany({});
  });

  afterAll(async () => {
    // Close mongoose connection handled by setupTestEnv.js
  });

  test('POST /api/users should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@example.com', role: 'reporter' })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe('test@example.com');
    createdUser = res.body;
  });

  test('GET /api/users should return list with meta', async () => {
    await User.create({ name: 'A', email: 'a@example.com', role: 'finder' });
    await User.create({ name: 'B', email: 'b@example.com', role: 'reporter' });

    const res = await request(app).get('/api/users').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
  });

  test('GET /api/users/:id should return a user', async () => {
    const user = await User.create({ name: 'C', email: 'c@example.com', role: 'finder' });
    const res = await request(app).get(`/api/users/${user._id}`).expect(200);
    expect(res.body.email).toBe('c@example.com');
  });

  test('PUT /api/users/:id should update a user', async () => {
    const user = await User.create({ name: 'D', email: 'd@example.com', role: 'reporter' });
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .send({ role: 'finder', credibilityScore: 90 })
      .expect(200);
    expect(res.body.role).toBe('finder');
    expect(res.body.credibilityScore).toBe(90);
  });

  test('DELETE /api/users/:id should archive the user', async () => {
    const user = await User.create({ name: 'E', email: 'e@example.com', role: 'reporter' });
    const res = await request(app).delete(`/api/users/${user._id}`).expect(200);
    expect(res.body.message).toMatch(/archived/);
    const fresh = await User.findById(user._id);
    expect(fresh.status).toBe('archived');
  });

  test('GET /api/users/:id/activity should return activity logs (empty array by default)', async () => {
    const user = await User.create({ name: 'F', email: 'f@example.com', role: 'reporter' });
    const res = await request(app).get(`/api/users/${user._id}/activity`).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
