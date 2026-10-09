import type { AdminPostDto } from '@shared/types';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PostEditor } from '@/components/admin/PostEditor';
import { useAdminPosts, useSavePost, useSetPublished } from '@/hooks/useContent';

/** /admin/new and /admin/:id. Loads the post, then hands it to the editor. */
export default function EditPost() {
  const { id } = useParams();
  const isNew = id === undefined;
  const posts = useAdminPosts();
  const save = useSavePost();
  const publish = useSetPublished();
  const navigate = useNavigate();

  if (!isNew && posts.isPending) return <p className="text-muted">Loading…</p>;
  const post = isNew ? null : posts.data?.find((p) => p.id === id);
  if (!isNew && !post) return <Navigate to="/admin" replace />;

  const onError = (error: Error) =>
    toast.error(error.message || 'Something went wrong. Try again.');

  return (
    <PostEditor
      key={post?.id ?? 'new'}
      post={post ?? null}
      saving={save.isPending}
      publishing={publish.isPending}
      onSave={(input) =>
        save.mutate(
          { id: post?.id ?? null, input },
          {
            onSuccess: (saved: AdminPostDto) => {
              toast.success(saved.isPublished ? 'Saved — live for readers' : 'Draft saved');
              if (isNew) navigate(`/admin/${saved.id}`, { replace: true });
            },
            onError,
          },
        )
      }
      onPublish={(next) =>
        post &&
        publish.mutate(
          { id: post.id, publish: next },
          {
            onSuccess: () => toast.success(next ? 'Published' : 'Moved back to drafts'),
            onError,
          },
        )
      }
    />
  );
}
