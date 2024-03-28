import { expect } from 'chai';
import request from 'supertest';
import { app, createAccount, createPost } from './helpers';

describe('request bodies', () => {
  it('answers malformed JSON with 400 and a readable message', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ')
      .expect(400);
    expect(response.body.message).to.equal('Request body is not valid JSON');
  });

  it('answers a body over the size limit with 413', async () => {
    const account = await createAccount();
    const response = await createPost(account.token, 'Too big', 'x'.repeat(300 * 1024)).expect(413);
    expect(response.body.message).to.equal('Request body is too large');
  });

  it('answers a write with no body at all with 400 and the missing fields', async () => {
    const account = await createAccount();
    const response = await request(app).post('/api/posts').set('authtoken', account.token).expect(400);
    expect(response.body.message).to.contain('Title is required');
    expect(response.body.message).to.contain('Content is required');
  });
});
