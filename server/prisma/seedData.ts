export interface SeedAuthor {
  name: string;
  email: string;
}

export interface SeedPost {
  authorEmail: string;
  title: string;
  content: string;
  /** Days before the seed run, so the feed has a believable spread of dates. */
  daysAgo: number;
}

export const SEED_AUTHORS: SeedAuthor[] = [
  { name: 'John Doe', email: 'johndoe@example.com' },
  { name: 'Priya Raman', email: 'priya@example.com' },
  { name: 'Tomas Leblanc', email: 'tomas@example.com' },
];

export const SEED_POSTS: SeedPost[] = [
  {
    authorEmail: 'johndoe@example.com',
    title: 'Why we stopped fetching authors in a loop',
    daysAgo: 1,
    content: [
      'Our post list used to be two queries deep. One call fetched the posts, then the view asked for the author of each one, which meant a page of ten posts issued eleven round trips to the database. It was fast enough on a laptop with three rows and unusable the moment the table had a few thousand.',
      'The fix is unglamorous: include the author in the same query the posts come from. Prisma turns that into one statement with a join, the page size bounds the work, and the request time stops scaling with the number of rows on the screen.',
      'The lesson that stuck was not about Prisma. It was that a loop around a query is almost always a join you have not written yet, and the only reliable way to notice is to look at the statements the request actually issues.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'priya@example.com',
    title: 'Pagination is a contract, not a parameter',
    daysAgo: 3,
    content: [
      'An endpoint that returns every row is a promise you cannot keep. It works during development, survives the demo, and then one customer imports their archive and the response never finishes.',
      'Adding page and pageSize is the easy half. The harder half is deciding what happens when someone asks for a page size of fifty thousand, and answering it the same way every time: clamp it, document the ceiling, and return the total so the client can render something honest.',
      'We return items, page, pageSize, total and totalPages on every list response. The client never has to guess whether there is more, and nobody has to add a second endpoint later to count things.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'tomas@example.com',
    title: 'Indexes for the queries you actually run',
    daysAgo: 5,
    content: [
      'Adding an index to every column is not a strategy, it is a tax on every write. The useful question is narrower: which columns does the application order by, filter on, or join through?',
      'For a blog the answer is short. The feed sorts by creation date descending. An author page filters by author and then sorts by the same column. That is two indexes, one of them composite, and it covers every read path the product has.',
      'Foreign keys deserve a mention of their own. Postgres does not index them for you, so a delete on the parent table has to scan the child table to enforce the constraint. If you ever intend to delete an account, index the column that points at it.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'johndoe@example.com',
    title: 'A standfirst is worth more than a truncated paragraph',
    daysAgo: 8,
    content: [
      'Chopping a post at one hundred and eighty characters and appending an ellipsis is the cheapest possible summary, and it reads like exactly that. Sentences end mid-clause, and the reader learns nothing about whether the post is worth opening.',
      'Keeping whole sentences while they fit is barely more code and reads like prose. When the first sentence is already too long, falling back to a word boundary at least avoids cutting a word in half.',
      'We compute the excerpt once, when the post is saved, and store it. The list endpoint then never touches the body of a post it is not going to show.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'priya@example.com',
    title: 'Measure, then choose the type scale',
    daysAgo: 11,
    content: [
      'Typography on a blog is not decoration, it is the product. The single biggest lever is measure: the number of characters on a line. Somewhere between sixty and seventy-five is comfortable, and a full-width paragraph on a desktop monitor is roughly double that.',
      'The second lever is the ratio between sizes. Picking a scale and sticking to it means headings, body text and captions relate to each other instead of being chosen one at a time.',
      'Everything after those two — colour, borders, shadows — is a rounding error on how readable the page feels.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'tomas@example.com',
    title: 'Checking ownership is not the same as checking a token',
    daysAgo: 14,
    content: [
      'Authentication answers who is calling. Authorisation answers whether they may do this to this row. An endpoint that verifies a token and then updates whatever id arrived in the path has only done the first half.',
      'The failure is quiet, because every request in your own testing happens to be for your own posts. It stays quiet right up until someone changes one character in a URL.',
      'The check belongs in the service layer, next to the business rule it protects, not sprinkled through controllers where it is easy to forget on the one route that was added last.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'johndoe@example.com',
    title: 'Config in one place, validated at boot',
    daysAgo: 18,
    content: [
      'Reading process.env at the point of use spreads defaults across the codebase, and the defaults disagree. One module falls back to a development secret, another treats the same variable as required, and the mismatch only shows up as a token that signs fine and never verifies.',
      'Loading the whole environment once, at startup, turns a subtle runtime bug into a startup error with the name of the missing variable in it.',
      'It also gives you somewhere obvious to put the constants that are not really configuration — the bcrypt work factor, the words-per-minute figure — instead of leaving them as unexplained numbers in the middle of a function.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'priya@example.com',
    title: 'Empty states are part of the feature',
    daysAgo: 22,
    content: [
      'A list view has at least four states: loading, empty, populated, and failed. Most implementations ship one of them and let the other three render as a blank rectangle.',
      'The empty state is the one that matters most, because it is the first thing a new account sees. It should say what would be here and how to put something here, not leave the reader wondering whether the page is broken.',
      'A search that returns nothing is a different empty state again. It should say what was searched for and offer a way back to everything.',
    ].join('\n\n'),
  },
  {
    authorEmail: 'tomas@example.com',
    title: 'The health check that tells you something',
    daysAgo: 27,
    content: [
      'An endpoint that returns two hundred and the word ok proves that the process is running. It proves nothing about whether the process can do its job.',
      'A health check that touches the database distinguishes between a container that is up and a container that is usable. That distinction is the whole reason the endpoint exists, because it is what an orchestrator uses to decide whether to send traffic.',
      'Keep it cheap. One trivial statement, no writes, and a response body naming the pieces that were checked.',
    ].join('\n\n'),
  },
];
