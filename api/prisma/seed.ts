/**
 * Development seed — a few KnowledgeArticles and one DRAFT BlogPost so the Learn
 * tab and the admin panel have something to render. No real users: the post's
 * author is a placeholder account that exists only because BlogPost.authorId is
 * required. Idempotent: everything is upserted by its natural key, so running
 * `npm run seed` twice leaves the database unchanged.
 *
 * Content note: this is starter copy for the founder and Sivi to replace. It
 * informs, never diagnoses, and never promises ovulation in advance.
 */
import { prisma } from '../src/lib/prisma';

const SEED_AUTHOR_SUB = 'seed-author-placeholder';

const ARTICLES = [
  {
    slug: 'what-a-cycle-actually-is',
    category: 'basics',
    orderIndex: 1,
    title: 'What a cycle actually is',
    bodyMarkdown: `Your cycle runs from the first day of your period to the day before the next one starts. Day 1 is the first day of real flow — spotting beforehand doesn't count.

Most cycles move through four rough phases: **menstrual** (bleeding), **follicular** (the body prepares an egg), **ovulatory** (an egg may be released) and **luteal** (the weeks after). Their lengths vary from person to person and from cycle to cycle, and a "28-day cycle" is an average, not a rule.

knowHer never assumes your cycle fits a template. It works from what you log.`,
  },
  {
    slug: 'spotting-versus-a-period',
    category: 'basics',
    orderIndex: 2,
    title: 'Spotting versus a period',
    bodyMarkdown: `**Spotting** is light bleeding that doesn't need a pad or cup. A **period** is the fuller flow that marks day 1 of a new cycle.

That's why knowHer asks "is this the start of your period?" when you log light-or-heavier flow on a day no cycle covers. Only you can answer that — the app never guesses a cycle boundary on your behalf. If you say no, the day stays in your log as bleeding, and you can reconcile it later.`,
  },
  {
    slug: 'reading-your-temperature-chart',
    category: 'cycle',
    orderIndex: 1,
    title: 'Reading your temperature chart',
    bodyMarkdown: `Basal body temperature (BBT) is your temperature on waking, before you move about. After ovulation it typically rises by around 0.4 °F and stays up until your next period.

knowHer draws a **coverline** through your pre-rise temperatures and looks for a sustained shift above it. Because the shift can only be seen once it has lasted a few days, ovulation is always **confirmed in hindsight** — usually about three days after it happened. The app will never tell you ovulation is coming; it tells you when it has been seen.

Mark readings taken after poor sleep, alcohol, illness or an unusual waking time as *unusual* so they don't pull the coverline off.`,
  },
  {
    slug: 'cervical-mucus-plainly',
    category: 'cycle',
    orderIndex: 2,
    title: 'Cervical mucus, plainly',
    bodyMarkdown: `Across a cycle, mucus usually changes in this order: **dry** → **sticky** → **watery** (like lotion) → **egg-white** (clear, stretchy). Egg-white mucus is the most fertile-looking kind.

The last egg-white day is called **peak day**. Like the temperature shift, it's only known afterwards — knowHer confirms it once a couple of non-egg-white days have followed. When your mucus and your temperatures point to different days, the app shows you both rather than picking one.`,
  },
  {
    slug: 'when-there-is-no-ovulation-this-cycle',
    category: 'cycle',
    orderIndex: 3,
    title: "When there's no ovulation this cycle",
    bodyMarkdown: `Some cycles pass without a clear temperature shift. These are called **anovulatory** cycles, and they are common — especially in the years after periods begin, around perimenopause, under stress, after illness, and with conditions like PCOD.

When knowHer doesn't see a shift, it says so calmly: *no ovulation detected this cycle*. That's information, not a verdict. One such cycle is rarely a concern. If it keeps happening, it's worth discussing with a doctor — knowHer can help you show them your charts, but it can't diagnose anything.`,
  },
  {
    slug: 'for-partners-and-family',
    category: 'supporters',
    orderIndex: 1,
    title: 'For partners and family',
    bodyMarkdown: `If someone you love uses knowHer, the most helpful thing you can do is take their cycle seriously without making it a big deal.

Energy, mood and focus genuinely shift across a cycle — that's hormones doing their job, not a character flaw. Ask what would help on a given day. Keep a heat pad where they can find it. Don't schedule the hard conversation for the day they said they'd rather rest. Small, steady support beats grand gestures.`,
  },
] as const;

async function main() {
  for (const article of ARTICLES) {
    const { slug, ...data } = article;
    await prisma.knowledgeArticle.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }

  const author = await prisma.user.upsert({
    where: { cognitoSub: SEED_AUTHOR_SUB },
    create: { cognitoSub: SEED_AUTHOR_SUB, displayName: 'Sivi (seed placeholder)', role: 'author' },
    update: { role: 'author' },
  });

  const post = {
    title: 'Welcome from Sivi',
    audience: 'user' as const,
    isPublished: false,
    bodyMarkdown: `This is a **draft** post seeded for development. It never appears to readers until an author publishes it from the admin panel.

Replace me with Sivi's first real note.`,
  };
  await prisma.blogPost.upsert({
    where: { slug: 'welcome-from-sivi' },
    create: { slug: 'welcome-from-sivi', authorId: author.id, ...post },
    update: post,
  });

  const [articles, posts, users] = await Promise.all([
    prisma.knowledgeArticle.count(),
    prisma.blogPost.count(),
    prisma.user.count(),
  ]);
  console.log(`seed ok — ${articles} articles, ${posts} blog post(s), ${users} user(s)`);
}

main()
  .catch((error: unknown) => {
    console.error('seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
