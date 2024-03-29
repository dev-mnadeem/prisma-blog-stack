-- Standfirst and reading time are computed once, at write time, so that the
-- list endpoint never has to load or re-scan post bodies.
ALTER TABLE "Post" ADD COLUMN "excerpt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Post" ADD COLUMN "readingMinutes" INTEGER NOT NULL DEFAULT 1;

-- The feed is ordered by createdAt DESC, optionally filtered to one author.
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt" DESC);
CREATE INDEX "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt" DESC);

-- Deleting an account should take its posts with it instead of erroring.
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
