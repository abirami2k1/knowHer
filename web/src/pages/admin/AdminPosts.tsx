import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AUDIENCE_LABEL } from '@/components/admin/audience';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useAdminPosts } from '@/hooks/useContent';
import { Loading, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

/** Every post, drafts included. Only authors reach this page. */
export default function AdminPosts() {
  const posts = useAdminPosts();

  return (
    <section aria-labelledby="admin-title" className="space-y-6">
      <header>
        <Eyebrow>Admin</Eyebrow>
        <h1 id="admin-title" className="mt-2 font-display text-display text-ink">
          Posts
        </h1>
      </header>

      <Link
        to="/admin/new"
        className="flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-medium text-paper hover:bg-primary/90"
      >
        <Plus aria-hidden className="size-5" /> New post
      </Link>

      {posts.isPending && (
        <Loading label="Loading your posts">
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </Loading>
      )}
      {posts.isError && (
        <p role="alert" className="text-primary">
          Couldn't load posts. Check your connection and try again.
        </p>
      )}
      {posts.data?.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No posts yet"
          body="Your first one starts as a draft — nothing is public until you publish it."
        />
      )}

      <ul className="space-y-2.5">
        {posts.data?.map((post) => (
          <li key={post.id}>
            <Link to={`/admin/${post.id}`} className="block rounded-card focus-visible:outline-2">
              <Card className="px-5 py-4 transition-colors hover:bg-surface-sunken">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-lg leading-snug text-ink">{post.title}</span>
                  <span
                    className={`shrink-0 rounded-pill px-2.5 py-1 text-xs font-medium ${
                      post.isPublished
                        ? 'bg-follicular-tint text-follicular'
                        : 'bg-surface-sunken text-muted'
                    }`}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  For {AUDIENCE_LABEL[post.audience]} · edited{' '}
                  {new Date(post.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
