import { createSummaryProvider } from '../src/ai';
import { config } from '../src/config';
import { readingMinutes } from '../src/domain/reading';
import { prisma } from '../src/db/prisma';
import { hashPassword } from '../src/services/authService';
import { SEED_AUTHORS, SEED_POSTS } from './seedData';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Demo password for the seeded accounts. Override with SEED_PASSWORD; it is
 * only ever used against a database you just seeded yourself.
 */
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'blogs-demo-2024';

async function main(): Promise<void> {
  const summaryProvider = createSummaryProvider(config);
  const password = hashPassword(SEED_PASSWORD);

  const authorIds = new Map<string, string>();
  for (const author of SEED_AUTHORS) {
    const user = await prisma.user.upsert({
      where: { email: author.email },
      update: { name: author.name },
      create: { ...author, password },
    });
    authorIds.set(author.email, user.id);
  }
  console.log(`Seeded ${authorIds.size} authors (password: ${SEED_PASSWORD})`);

  let written = 0;
  for (const post of SEED_POSTS) {
    const authorId = authorIds.get(post.authorEmail);
    if (!authorId) {
      throw new Error(`Seed post "${post.title}" references unknown author ${post.authorEmail}`);
    }

    const existing = await prisma.post.findFirst({ where: { title: post.title, authorId } });
    if (existing) {
      continue;
    }

    const createdAt = new Date(Date.now() - post.daysAgo * MS_PER_DAY);
    await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        authorId,
        createdAt,
        updatedAt: createdAt,
        readingMinutes: readingMinutes(post.content, config.wordsReadPerMinute),
        excerpt: await summaryProvider.summarise({
          title: post.title,
          content: post.content,
          maxChars: config.excerptMaxChars,
        }),
      },
    });
    written += 1;
  }

  console.log(`Seeded ${written} posts (excerpts via "${summaryProvider.name}" provider)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
