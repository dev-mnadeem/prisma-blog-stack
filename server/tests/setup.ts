/**
 * Test defaults. Unit tests must run with no .env at all, and the API tests
 * need a database — point TEST_DATABASE_URL at a throwaway one.
 */
process.env.NODE_ENV = 'test';
process.env.SUMMARY_PROVIDER = 'local';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-not-used-outside-tests';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? 'postgresql://blogs:blogs@localhost:7233/blogs';
