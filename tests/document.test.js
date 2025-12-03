const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const DocumentReport = require('../models/DocumentReport');

describe('Documents API', () => {
  let reporter;

  beforeEach(async () => {
    await User.deleteMany({});
    await DocumentReport.deleteMany({});
    reporter = await User.create({ name: 'Reporter', email: 'rep@example.com', role: 'reporter' });
  });

  afterAll(async () => {
    // teardown handled by setupTestEnv
  });

  test('POST /api/documents should create a document report', async () => {
    const res = await request(app)
      .post('/api/documents')
      .send({
        documentType: 'Passport',
        description: 'Lost near park',
        dateLost: '2023-01-01',
        location: 'Park',
        status: 'lost',
        reportedBy: reporter._id.toString()
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.documentType).toBe('Passport');
  });

  test('GET /api/documents should return results and support search', async () => {
    await DocumentReport.create({
      documentType: 'ID Card',
      description: 'Found ID near library',
      dateLost: new Date('2024-01-01'),
      location: 'Library',
      status: 'found',
      reportedBy: reporter._id
    });

    const res = await request(app).get('/api/documents?q=library').expect(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/documents/:id should populate reportedBy', async () => {
    const doc = await DocumentReport.create({
      documentType: 'Driver License',
      description: 'Lost DL',
      dateLost: new Date(),
      location: 'Market',
      status: 'lost',
      reportedBy: reporter._id
    });

    const res = await request(app).get(`/api/documents/${doc._id}`).expect(200);
    expect(res.body).toHaveProperty('reportedBy');
    expect(res.body.reportedBy.email).toBe(reporter.email);
  });

  test('PUT /api/documents/:id should update status', async () => {
    const doc = await DocumentReport.create({
      documentType: 'ID',
      description: 'Some desc',
      dateLost: new Date(),
      location: 'Office',
      status: 'lost',
      reportedBy: reporter._id
    });

    const res = await request(app)
      .put(`/api/documents/${doc._id}`)
      .send({ status: 'claimed' })
      .expect(200);

    expect(res.body.status).toBe('claimed');
  });

  test('DELETE /api/documents/:id should delete report', async () => {
    const doc = await DocumentReport.create({
      documentType: 'Card',
      description: 'desc',
      dateLost: new Date(),
      location: 'Place',
      status: 'lost',
      reportedBy: reporter._id
    });

    await request(app).delete(`/api/documents/${doc._id}`).expect(204);
    const found = await DocumentReport.findById(doc._id);
    expect(found).toBeNull();
  });
});
