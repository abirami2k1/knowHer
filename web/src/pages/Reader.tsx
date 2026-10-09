import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Markdown } from '@/components/content/Markdown';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useBlogPost, useKnowledge } from '@/hooks/useContent';

const CATEGORY_LABEL: Record<string, string> = {
  basics: 'The basics',
  cycle: 'Your cycle',
  supporters: 'For supporters',
};

interface Readable {
  eyebrow: string;
  title: string;
  byline?: string;
  body: string;
  back: string;
}

/** The mobile reading view for both knowledge articles and Sivi's posts. */
export default function Reader() {
  const { kind, slug = '' } = useParams();
  return kind === 'post' ? <PostReader slug={slug} /> : <ArticleReader slug={slug} />;
}

function ArticleReader({ slug }: { slug: string }) {
  const knowledge = useKnowledge();
  const article = knowledge.data?.find((a) => a.slug === slug);
  const section = article?.category === 'supporters' ? 'supporters' : 'basics';
  return (
    <ReaderView
      isPending={knowledge.isPending}
      readable={
        article && {
          eyebrow: CATEGORY_LABEL[article.category] ?? 'Learn',
          title: article.title,
          body: article.bodyMarkdown,
          back: `/learn?section=${section}`,
        }
      }
    />
  );
}

function PostReader({ slug }: { slug: string }) {
  const post = useBlogPost(slug);
  const p = post.data;
  return (
    <ReaderView
      isPending={post.isPending}
      readable={
        p && {
          eyebrow: 'From Sivi',
          title: p.title,
          byline: [
            p.authorName,
            new Date(p.publishedAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          ]
            .filter(Boolean)
            .join(' · '),
          body: p.bodyMarkdown,
          back: `/learn?section=${p.audience === 'supporter' ? 'supporters' : 'sivi'}`,
        }
      }
    />
  );
}

function ReaderView({ isPending, readable }: { isPending: boolean; readable?: Readable }) {
  if (isPending) return <p className="text-muted">Loading…</p>;

  return (
    <article className="space-y-6">
      <Link
        to={readable?.back ?? '/learn'}
        className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-pill pr-3 pl-1 text-sm font-medium text-ink-soft hover:bg-surface-sunken"
      >
        <ChevronLeft aria-hidden className="size-5" /> Learn
      </Link>

      {readable ? (
        <>
          <header>
            <Eyebrow>{readable.eyebrow}</Eyebrow>
            <h1 className="mt-2 font-display text-title text-ink">{readable.title}</h1>
            {readable.byline && <p className="mt-2 text-sm text-muted">{readable.byline}</p>}
          </header>
          <Markdown source={readable.body} />
        </>
      ) : (
        <Card tone="quiet" className="p-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            This piece isn't available — it may have been taken down for an update.
          </p>
        </Card>
      )}
    </article>
  );
}
