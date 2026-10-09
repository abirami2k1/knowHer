import type { AdminPostDto, Audience, BlogPostInput } from '@shared/types';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AUDIENCE_OPTIONS } from '@/components/admin/audience';
import { Markdown } from '@/components/content/Markdown';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';
import { ChoiceList } from '@/components/ui/ChoiceList';
import { Field } from '@/components/ui/Field';

interface PostEditorProps {
  post: AdminPostDto | null;
  saving: boolean;
  publishing: boolean;
  onSave: (input: BlogPostInput) => void;
  onPublish: (publish: boolean) => void;
}

/**
 * A simple, forgiving editor: plain markdown in a textarea, a preview that renders
 * exactly what readers will see, and publishing kept separate from saving so a
 * half-finished edit never goes live by accident.
 */
export function PostEditor({ post, saving, publishing, onSave, onPublish }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [audience, setAudience] = useState<Audience>(post?.audience ?? 'user');
  const [body, setBody] = useState(post?.bodyMarkdown ?? '');
  const [preview, setPreview] = useState(false);
  const bodyId = useId();

  const input = { title: title.trim(), bodyMarkdown: body.trim(), audience };
  const canSave = input.title.length > 0 && input.bodyMarkdown.length > 0;
  const dirty =
    !post ||
    input.title !== post.title ||
    input.bodyMarkdown !== post.bodyMarkdown ||
    audience !== post.audience;

  return (
    <section aria-labelledby="editor-title" className="space-y-6">
      <header>
        <Link to="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
          ← All posts
        </Link>
        <Eyebrow className="mt-4">
          {post ? (post.isPublished ? 'Published' : 'Draft') : 'New post'}
        </Eyebrow>
        <h1 id="editor-title" className="mt-2 font-display text-title text-ink">
          {post ? 'Edit post' : 'Write a post'}
        </h1>
        {post && <p className="mt-1 text-sm text-muted">Address: /learn/post/{post.slug}</p>}
      </header>

      <Field
        label="Title"
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
      />

      <ChoiceList
        legend="Who it's for"
        options={AUDIENCE_OPTIONS}
        selected={[audience]}
        onSelect={setAudience}
        layout="pills"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={bodyId} className="text-sm font-medium text-ink">
            Post
          </label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            className="min-h-11 rounded-pill px-3 text-sm font-medium text-primary hover:bg-surface-sunken"
          >
            {preview ? 'Back to writing' : 'Preview'}
          </button>
        </div>
        {preview ? (
          <Card className="min-h-64 p-5">
            {input.bodyMarkdown ? (
              <Markdown source={input.bodyMarkdown} />
            ) : (
              <p className="text-muted">Nothing to preview yet.</p>
            )}
          </Card>
        ) : (
          <>
            <textarea
              id={bodyId}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="block w-full rounded-2xl bg-surface p-4 font-mono text-[15px] leading-relaxed text-ink ring-1 ring-line focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <p className="text-sm text-muted">
              **bold**, *italic*, ## heading, - list, [link](https://…). Blank line between
              paragraphs.
            </p>
          </>
        )}
      </div>

      <div className="space-y-3">
        <Button onClick={() => onSave(input)} disabled={!canSave || !dirty} loading={saving}>
          {post?.isPublished ? 'Save changes' : 'Save draft'}
        </Button>
        {post && (
          <Button
            variant="secondary"
            onClick={() => onPublish(!post.isPublished)}
            disabled={dirty}
            loading={publishing}
          >
            {post.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        )}
        {post && dirty && (
          <p className="text-center text-sm text-muted">Save your changes before publishing.</p>
        )}
        {post?.isPublished && !dirty && (
          <p className="text-center text-sm text-muted">
            Saved changes go live straight away while this post is published.
          </p>
        )}
      </div>
    </section>
  );
}
