# Blogs

A small publishing app in two npm workspaces: an Express + Prisma API in `server/` and a React reading client in `web/`. Anyone can read; an account is needed to write, edit or delete, and only the author of a post can change it. When a post is saved the API works out a short standfirst and a reading time, so the feed never has to load or re-scan post bodies.

![The feed on a desktop browser](docs/screenshots/feed-desktop.png)

| Reading a post on a phone | The feed on a phone |
| --- | --- |
| ![A post at 390px wide](docs/screenshots/post-mobile.png) | ![The feed at 390px wide](docs/screenshots/feed-mobile.png) |

## What it does

- Sign up and sign in with email and password. The API returns a JWT that it accepts as `Authorization: Bearer <token>` or as an `authtoken` header (which the web client uses).
- Write, edit and delete your own posts. Other accounts get a 403 from the API, and the client does not offer them the edit form. Deleting asks for confirmation first.
- A paginated feed, newest first, with case-insensitive search over titles and bodies. Each author's name links to a feed of just their posts (`/?author=<id>`).
- A standfirst for every post, generated when it is saved. By default this is a deterministic extract of whole sentences. An optional provider can ask the Anthropic API instead, and it falls back to the extract on any failure.
- `GET /api/health` runs a query against the database rather than only reporting that the process is up.

| | |
| --- | --- |
| ![Editing a post](docs/screenshots/editor-desktop.png) | ![Confirming a delete](docs/screenshots/delete-confirm-desktop.png) |

## Quick start with Docker Compose

Docker is the only requirement.

```bash
docker compose up --build -d
docker compose --profile seed run --rm seed
```

The first command starts Postgres, applies the migrations in a one-shot `migrate` service, and then starts the API and the client. The second command loads three demo authors and nine posts. Then open:

- the client: http://localhost:7232
- the API: http://localhost:7231/api/health
- Postgres, if you want it: `localhost:7233`, user, password and database all `blogs`

Every demo account uses the password `blogs-demo-2024`, for example `johndoe@example.com`. To use a different one, run the seed with `SEED_PASSWORD=... docker compose --profile seed run --rm seed`.

The stack signs tokens with a placeholder secret unless you provide one: `JWT_SECRET=$(openssl rand -hex 32) docker compose up -d`, or put `JWT_SECRET=...` in a `.env` file next to `docker-compose.yml`.

Stop everything and delete the database volume with `docker compose --profile seed down -v`.

## Running on the host

You need Node 22.12 or later (see `.nvmrc`) and a Postgres database. The Compose file can provide the database on its own:

```bash
docker compose up -d db
npm install
cp server/.env.example server/.env    # DATABASE_URL already points at the Compose database
cp web/.env.example web/.env
npm run setup                         # prisma generate, migrate deploy, seed
npm run dev                           # API on :7231 and client on :7232, with reload
```

`npm run build` compiles the API to `server/dist/` and the client to `web/dist/`. `npm start -w @blogs/server` then runs the compiled API.

### Configuration

The API reads its environment once, at startup (`server/src/config/index.ts`). If `server/.env` exists it is loaded, but variables that are already set take precedence.

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | none, required | Postgres connection string |
| `JWT_SECRET` | none, required | Any long random string |
| `JWT_TTL_SECONDS` | `43200` | Token lifetime (12 hours) |
| `PORT` | `7231` | |
| `CORS_ORIGINS` | `http://localhost:7232` | Comma-separated list |
| `BCRYPT_ROUNDS` | `10` | |
| `SUMMARY_PROVIDER` | `local` | `local` or `anthropic` |
| `ANTHROPIC_API_KEY` | unset | Only read when the provider is `anthropic`. If it is missing, the API logs a warning and uses `local` |
| `ANTHROPIC_MODEL` | `claude-opus-5` | |

The client has a single setting, `VITE_API_URL` (default `http://localhost:7231/api`). Vite builds it into the bundle, which is why the client's Dockerfile takes it as a build argument.

## API

Every response is an envelope. Successful responses are `{ "payload": ... }`, and errors are `{ "payload": {}, "message": "..." }`.

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | none |
| `POST` | `/api/auth/login` | none |
| `GET` | `/api/auth/me` | token |
| `GET` | `/api/posts?search=&author=&page=&pageSize=` | none |
| `GET` | `/api/posts/:id` | none |
| `POST` | `/api/posts` | token |
| `PUT` | `/api/posts/:id` | token, author only |
| `DELETE` | `/api/posts/:id` | token, author only |
| `GET` | `/api/health` | none |

`pageSize` defaults to 10 and is capped at 50. `page` must be between 1 and 1,000,000. In a search, `%` and `_` match those literal characters rather than acting as wildcards.

These exchanges were captured from the Compose stack above, with the tokens shortened:

```text
POST /api/auth/login {"email":"johndoe@example.com","password":"blogs-demo-2024"}
HTTP 200
{ "payload": { "authtoken": "eyJhbG…xRPk" } }

POST /api/posts  (Authorization: Bearer …)
{"title":"Notes on standfirsts","content":"A list view has room for two lines under each title. Those two lines decide whether the post gets opened, so they are written once, when the post is saved."}
HTTP 201
{
  "payload": {
    "id": "822b0108-4c55-4344-bb77-e2f2ead43d51",
    "title": "Notes on standfirsts",
    "content": "A list view has room for two lines under each title. …",
    "excerpt": "A list view has room for two lines under each title. Those two lines decide whether the post gets opened, so they are written once, when the post is saved.",
    "readingMinutes": 1,
    "createdAt": "2026-11-07T21:50:53.378Z",
    "updatedAt": "2026-11-07T21:50:53.378Z",
    "author": { "id": "66d27a27-f010-4874-82a6-1be77963c0e7", "name": "John Doe" }
  }
}

GET /api/posts?pageSize=2
HTTP 200
{
  "payload": {
    "items": [
      {
        "id": "4a60c83e-f606-4cf4-b310-1f6e879b2964",
        "title": "Why we stopped fetching authors in a loop",
        "excerpt": "Our post list used to be two queries deep.",
        "readingMinutes": 1,
        "author": { "id": "66d27a27-…", "name": "John Doe" },
        "…": "content, createdAt, updatedAt"
      },
      { "…": "one more post" }
    ],
    "page": 1,
    "pageSize": 2,
    "total": 9,
    "totalPages": 5
  }
}

DELETE /api/posts/822b0108-…  (signed in as a different author)
HTTP 403
{ "payload": {}, "message": "You can only change your own posts" }

POST /api/posts {"title":"ok"}
HTTP 400
{ "payload": {}, "message": "title must be at least 3 characters, Content is required" }

GET /api/posts?page=1e20
HTTP 400
{ "payload": {}, "message": "page must be less than or equal to 1000000" }

GET /api/health
HTTP 200
{ "payload": { "status": "ok", "database": "reachable", "summaryProvider": "local", "uptimeSeconds": 614 } }
```

Request bodies that are not valid JSON get a 400. Bodies over 256 kB get a 413. A health check that cannot reach the database answers 503.

## How it is put together

```mermaid
flowchart LR
  subgraph web["web/ (React 19, MUI, React Router)"]
    pages["pages/*"] --> apiClient["api/client.ts<br/>axios + authtoken cookie"]
  end
  apiClient -- "JSON over HTTP" --> routes
  subgraph server["server/ (Express 5)"]
    routes["routes/*<br/>authenticate middleware"] --> controllers["controllers/*<br/>yup validation"]
    controllers --> services["services/*<br/>ownership, pagination, tokens"]
    services --> repos["repositories/*<br/>Prisma queries"]
    services --> summary["ai/ SummaryProvider<br/>local | anthropic"]
  end
  repos --> db[("PostgreSQL 16")]
```

Saving a post goes through the service, which asks the summary provider for the standfirst:

```mermaid
sequenceDiagram
  participant C as Client
  participant S as postService
  participant P as SummaryProvider
  participant R as postRepository
  C->>S: create(authorId, {title, content})
  S->>P: summarise({title, content, maxChars: 180})
  P-->>S: excerpt (local extract, or Claude with the extract as fallback)
  S->>R: insert post + excerpt + readingMinutes
  R-->>C: post with author (one query, no N+1)
```

Design choices worth knowing about:

- **Derived fields are stored.** The excerpt and reading time are computed once, on write, so the feed only reads short columns. Editing a post recomputes both.
- **The summary provider is a seam.** `SummaryProvider` has one method, and a small registry picks the implementation from `SUMMARY_PROVIDER`. The local extract keeps whole sentences while they fit in 180 characters, and otherwise cuts at a word boundary. Any failure in the remote provider falls back to the local extract, so it can never fail a save. All tests use the local provider.
- **Authorisation lives in the service.** `loadOwned` checks the author before any update or delete. A row that vanishes between the check and the write is reported as a 404, not a 500.
- **Feed queries follow the indexes.** The feed sorts by `createdAt DESC`, which is indexed on its own and together with `authorId` for the author filter. `id` breaks ties, so pages keep a stable order when timestamps are equal. The count and the page are read in one transaction.
- **One login error.** An unknown email and a wrong password get the same 401, so the login form can't be used to find out which accounts exist. Tokens are HS256 only. Passwords are hashed with bcrypt's async API, so a sign-up does not hold up other requests while it hashes.
- **The client checks the session with the server.** On load, the client asks `/auth/me` who the cookie's token belongs to, instead of trusting a flag cached in the browser.

## Tests and checks

```bash
npm run lint        # ESLint 9 in both workspaces
npm run typecheck
npm test            # server unit + API tests, then the web tests
```

| Suite | Command | Count | Needs |
| --- | --- | --- | --- |
| Server unit | `npm run test:unit -w @blogs/server` | 11 | nothing |
| Server API (supertest) | `npm run test:api -w @blogs/server` | 29 | Postgres |
| Web (Vitest, Testing Library) | `npm test -w @blogs/web` | 38 | nothing |

The API tests use `TEST_DATABASE_URL` (or `DATABASE_URL`) and leave their rows behind, so point them at a throwaway database rather than the one you seeded:

```bash
docker compose up -d db
docker compose exec db createdb -U blogs blogs_test
DATABASE_URL=postgresql://blogs:blogs@localhost:7233/blogs_test npm run prisma:migrate -w @blogs/server
TEST_DATABASE_URL=postgresql://blogs:blogs@localhost:7233/blogs_test npm run test:api -w @blogs/server
```

## Limitations

- Search uses `ILIKE` with a leading wildcard, which scans every row. That is fine for a blog with a few thousand posts; a larger one would need a `pg_trgm` index or full-text search.
- Tokens last 12 hours, there is no refresh token, and signing out only clears the cookie.
- Posts are plain text split into paragraphs on blank lines. There is no Markdown, no drafts and no comments.
- The Anthropic provider has not been exercised against the live API in this repository's tests.
