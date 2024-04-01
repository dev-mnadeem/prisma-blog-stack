import { expect } from 'chai';
import request from 'supertest';
import { app, createAccount } from './helpers';

describe('authentication', () => {
  it('registers an account and returns it without the password', async () => {
    const email = `signup-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Ada Lovelace', email, password: 'analytical engine' })
      .expect(201);

    expect(response.body.payload.email).to.equal(email);
    expect(response.body.payload).to.not.have.property('password');
  });

  it('rejects a duplicate email with 409', async () => {
    const account = await createAccount();
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Someone Else', email: account.email, password: account.password })
      .expect(409);

    expect(response.body.message).to.equal('User already exists');
  });

  it('rejects a short password with a field message', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Too Short', email: `short-${Date.now()}@example.com`, password: 'abc' })
      .expect(400);

    expect(response.body.message).to.contain('password');
  });

  it('gives the same message for an unknown email and a wrong password', async () => {
    const account = await createAccount();

    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: `nobody-${Date.now()}@example.com`, password: account.password })
      .expect(401);
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: account.email, password: 'not the password' })
      .expect(401);

    expect(unknown.body.message).to.equal('Invalid email/password');
    expect(wrong.body.message).to.equal(unknown.body.message);
  });

  it('returns the signed-in account from /me', async () => {
    const account = await createAccount('Grace Hopper');
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${account.token}`).expect(200);

    expect(response.body.payload.name).to.equal('Grace Hopper');
  });

  it('rejects a tampered token', async () => {
    const account = await createAccount();
    await request(app).get('/api/auth/me').set('authtoken', `${account.token}tampered`).expect(401);
  });
});
