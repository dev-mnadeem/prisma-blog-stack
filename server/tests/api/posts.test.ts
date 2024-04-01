import { expect } from 'chai';
import request from 'supertest';
import { app, createAccount, createPost, TestAccount } from './helpers';

const BODY = [
  'Pagination is a contract between the endpoint and everything that calls it.',
  'Without a ceiling on page size, one client can ask for the whole table.',
].join(' ');

describe('posts', () => {
  let author: TestAccount;

  before(async () => {
    author = await createAccount('Post Author');
  });

  it('stores an excerpt and a reading time when a post is created', async () => {
    const response = await createPost(author.token, 'Excerpts are derived', BODY).expect(201);
    const post = response.body.payload;

    expect(post.excerpt).to.be.a('string').and.not.empty;
    expect(post.excerpt.length).to.be.at.most(180);
    expect(post.readingMinutes).to.be.at.least(1);
    expect(post.author.name).to.equal('Post Author');
    expect(post.author).to.not.have.property('email');
  });

  it('rejects an unauthenticated write', async () => {
    await request(app).post('/api/posts').send({ title: 'No token', content: BODY }).expect(401);
  });

  it('rejects a post that is too short to be a post', async () => {
    const response = await createPost(author.token, 'ok', 'tiny').expect(400);
    expect(response.body.message).to.contain('title');
  });

  it('lists posts newest first, with the author included', async () => {
    const response = await request(app).get('/api/posts?pageSize=5').expect(200);
    const { items, page, pageSize, total, totalPages } = response.body.payload;

    expect(items).to.be.an('array');
    expect(page).to.equal(1);
    expect(pageSize).to.equal(5);
    expect(total).to.be.a('number');
    expect(totalPages).to.equal(Math.ceil(total / 5));

    const dates = items.map((item: { createdAt: string }) => Date.parse(item.createdAt));
    expect(dates).to.deep.equal([...dates].sort((a: number, b: number) => b - a));
    for (const item of items) {
      expect(item.author.name).to.be.a('string');
    }
  });

  it('clamps an oversized page size instead of returning everything', async () => {
    const response = await request(app).get('/api/posts?pageSize=100000').expect(200);
    expect(response.body.payload.pageSize).to.equal(50);
  });

  it('searches titles and bodies case-insensitively', async () => {
    const marker = `Zebra${Date.now()}`;
    await createPost(author.token, `A post about ${marker}`, BODY).expect(201);

    const response = await request(app).get(`/api/posts?search=${marker.toLowerCase()}`).expect(200);

    expect(response.body.payload.total).to.equal(1);
    expect(response.body.payload.items[0].title).to.contain(marker);
  });

  it('filters by author', async () => {
    const other = await createAccount('Other Author');
    await createPost(other.token, 'Only mine', BODY).expect(201);

    const me = await request(app).get('/api/auth/me').set('authtoken', other.token).expect(200);
    const response = await request(app).get(`/api/posts?author=${me.body.payload.id}`).expect(200);

    expect(response.body.payload.total).to.equal(1);
    expect(response.body.payload.items[0].title).to.equal('Only mine');
  });

  it('returns a single post by id and 404 for an unknown one', async () => {
    const created = await createPost(author.token, 'Fetch me by id', BODY).expect(201);
    const response = await request(app).get(`/api/posts/${created.body.payload.id}`).expect(200);
    expect(response.body.payload.content).to.equal(BODY);

    await request(app).get('/api/posts/2f1b4a9c-0000-4000-8000-000000000000').expect(404);
  });

  it('recomputes the excerpt when a post is edited', async () => {
    const created = await createPost(author.token, 'Before the edit', BODY).expect(201);
    const updated = await request(app)
      .put(`/api/posts/${created.body.payload.id}`)
      .set('authtoken', author.token)
      .send({ title: 'After the edit', content: 'A completely different body for this post.' })
      .expect(200);

    expect(updated.body.payload.title).to.equal('After the edit');
    expect(updated.body.payload.excerpt).to.not.equal(created.body.payload.excerpt);
  });

  it('refuses to let one author edit another author post', async () => {
    const intruder = await createAccount('Intruder');
    const created = await createPost(author.token, 'Not yours to edit', BODY).expect(201);

    const response = await request(app)
      .put(`/api/posts/${created.body.payload.id}`)
      .set('authtoken', intruder.token)
      .send({ title: 'Hijacked title', content: BODY })
      .expect(403);

    expect(response.body.message).to.contain('your own posts');
  });

  it('refuses to let one author delete another author post', async () => {
    const intruder = await createAccount('Deleter');
    const created = await createPost(author.token, 'Not yours to delete', BODY).expect(201);

    await request(app).delete(`/api/posts/${created.body.payload.id}`).set('authtoken', intruder.token).expect(403);

    await request(app).get(`/api/posts/${created.body.payload.id}`).expect(200);
  });

  it('deletes a post the caller owns', async () => {
    const created = await createPost(author.token, 'Mine to delete', BODY).expect(201);

    await request(app).delete(`/api/posts/${created.body.payload.id}`).set('authtoken', author.token).expect(204);

    await request(app).get(`/api/posts/${created.body.payload.id}`).expect(404);
  });
});
