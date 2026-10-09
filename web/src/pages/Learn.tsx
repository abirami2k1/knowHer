import type { BlogPostSummary, KnowledgeArticleDto } from '@shared/types';
import { Link, useSearchParams } from 'react-router-dom';
import { ContentList, type ContentItem } from '@/components/learn/ContentList';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useBlog, useKnowledge } from '@/hooks/useContent';

const SECTIONS = [
  { id: 'basics', label: 'Basics' },
  { id: 'sivi', label: 'From Sivi' },
  { id: 'supporters', label: 'For supporters' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

const articleItems = (articles: KnowledgeArticleDto[], category: string): ContentItem[] =>
  articles
    .filter((a) => a.category === category)
    .map((a) => ({ to: `/learn/article/${a.slug}`, title: a.title }));

const postItems = (posts: BlogPostSummary[]): ContentItem[] =>
  posts.map((p) => ({
    to: `/learn/post/${p.slug}`,
    title: p.title,
    meta: new Date(p.publishedAt).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }));

/** The Learn tab: period basics, Sivi's notes, and guidance for the people around her. */
export default function Learn() {
  const [params] = useSearchParams();
  const section: Section = SECTIONS.some((s) => s.id === params.get('section'))
    ? (params.get('section') as Section)
    : 'basics';

  const knowledge = useKnowledge();
  const forUser = useBlog('user');
  const forSupporters = useBlog('supporter');
  const articles = knowledge.data ?? [];

  const lists: Record<Section, { heading: string; items: ContentItem[] }[]> = {
    basics: [
      { heading: 'The basics', items: articleItems(articles, 'basics') },
      { heading: 'Your cycle', items: articleItems(articles, 'cycle') },
    ],
    sivi: [{ heading: 'Notes from Sivi', items: postItems(forUser.data ?? []) }],
    supporters: [
      { heading: 'Guides', items: articleItems(articles, 'supporters') },
      { heading: 'Notes from Sivi', items: postItems(forSupporters.data ?? []) },
    ],
  };
  const active =
    section === 'basics'
      ? [knowledge]
      : section === 'sivi'
        ? [forUser]
        : [knowledge, forSupporters];
  const isPending = active.some((q) => q.isPending);
  const isError = active.some((q) => q.isError);
  const isEmpty = lists[section].every((l) => l.items.length === 0);

  return (
    <section aria-labelledby="learn-title" className="space-y-6">
      <header>
        <Eyebrow>Learn</Eyebrow>
        <h1 id="learn-title" className="mt-2 font-display text-display text-ink">
          Worth knowing
        </h1>
      </header>

      <nav aria-label="Learn sections" className="flex gap-2 overflow-x-auto">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            to={`/learn?section=${s.id}`}
            replace
            aria-current={s.id === section ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-pill px-4 text-sm font-medium transition-colors ${
              s.id === section
                ? 'bg-primary text-paper'
                : 'bg-surface text-ink-soft ring-1 ring-line hover:bg-surface-sunken'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {isPending && <p className="text-muted">Loading…</p>}
      {isError && (
        <p role="alert" className="text-primary">
          Couldn't load this section. Check your connection and try again.
        </p>
      )}

      {!isPending && !isError && isEmpty && (
        <Card tone="quiet" className="p-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Nothing here yet — new pieces will appear as they're published.
          </p>
        </Card>
      )}

      {!isPending &&
        lists[section].map((list) => (
          <ContentList key={list.heading} heading={list.heading} items={list.items} />
        ))}
    </section>
  );
}
