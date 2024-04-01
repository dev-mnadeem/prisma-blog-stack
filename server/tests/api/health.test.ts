import { expect } from 'chai';
import request from 'supertest';
import { app } from './helpers';

describe('GET /api/health', () => {
  it('reports the database as reachable', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.payload.status).to.equal('ok');
    expect(response.body.payload.database).to.equal('reachable');
    expect(response.body.payload.summaryProvider).to.equal('local');
  });
});

describe('unknown routes', () => {
  it('answers 404 with a message instead of HTML', async () => {
    const response = await request(app).get('/api/nope').expect(404);
    expect(response.body.message).to.contain('/api/nope');
  });
});
