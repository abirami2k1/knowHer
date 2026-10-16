import type {
  AdminPostDto,
  BlogPostDto,
  BlogPostSummary,
  KnowledgeArticleDto,
  KnowledgeCategory,
} from '../../../shared/types';
import type { BlogPost, Prisma } from '../generated/prisma/client';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { slugify } from '../lib/slug';
import type { CreatePostInput, UpdatePostInput } from '../schemas/content';

/**
 * Knowledge articles and Sivi's blog. Readers only ever see published posts —
 * the filter lives in every public query here, never in the route or the UI.
 */

type PostWithAuthor = BlogPost & { author: { displayName: string | null } };
const WITH_AUTHOR = { author: { select: { displayName: true } } } as const;

/** A reader's section shows posts written for it, plus those written for everyone. */
function audienceFilter(audience?: 'user' | 'supporter'): Prisma.BlogPostWhereInput {
  return audience ? { audience: { in: [audience, 'both'] } } : {};
}

export async function listKnowledge(category?: KnowledgeCategory): Promise<KnowledgeArticleDto[]> {
  const articles = await prisma.knowledgeArticle.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
  });
  return articles.map(({ slug, title, category: c, bodyMarkdown }) => ({
    slug,
    title,
    category: c as KnowledgeCategory,
    bodyMarkdown,
  }));
}

function toSummary(post: PostWithAuthor): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    audience: post.audience,
    // Published posts always have one; the fallback only guards a hand-edited row.
    publishedAt: (post.publishedAt ?? post.updatedAt).toISOString(),
    authorName: post.author.displayName,
  };
}

export async function listPublishedPosts(
  audience?: 'user' | 'supporter',
): Promise<BlogPostSummary[]> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true, ...audienceFilter(audience) },
    orderBy: { publishedAt: 'desc' },
    include: WITH_AUTHOR,
  });
  return posts.map(toSummary);
}

/** A draft answers exactly like a missing post, so its existence never leaks. */
export async function findPublishedPost(slug: string): Promise<BlogPostDto> {
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    include: WITH_AUTHOR,
  });
  if (!post) throw new AppError(404, 'not_found', "That post isn't available");
  return { ...toSummary(post), bodyMarkdown: post.bodyMarkdown };
}

// ── Author side ──────────────────────────────────────────────────────────────
// Authors are a small editorial team (Sivi and the founder), so any author can
// edit any post — the seed draft, for one, belongs to a placeholder account.

function toAdmin(post: PostWithAuthor): AdminPostDto {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    audience: post.audience,
    bodyMarkdown: post.bodyMarkdown,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
    authorName: post.author.displayName,
  };
}

export async function listAllPosts(): Promise<AdminPostDto[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    include: WITH_AUTHOR,
  });
  return posts.map(toAdmin);
}

/** The first free slug: base, base-2, base-3… The slug is fixed once created, so links keep working. */
async function uniqueSlug(base: string): Promise<string> {
  const taken = new Set(
    (
      await prisma.blogPost.findMany({
        where: { slug: { startsWith: base } },
        select: { slug: true },
      })
    ).map((p) => p.slug),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** One author's posts, drafts included — for her own export. */
export async function listPostsByAuthor(authorId: string): Promise<AdminPostDto[]> {
  const posts = await prisma.blogPost.findMany({
    where: { authorId },
    orderBy: { createdAt: 'asc' },
    include: WITH_AUTHOR,
  });
  return posts.map(toAdmin);
}

/** New posts always start as drafts. */
export async function createPost(authorId: string, input: CreatePostInput): Promise<AdminPostDto> {
  const post = await prisma.blogPost.create({
    data: { ...input, authorId, slug: await uniqueSlug(slugify(input.title)) },
    include: WITH_AUTHOR,
  });
  return toAdmin(post);
}

async function existing(id: string): Promise<BlogPost> {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new AppError(404, 'not_found', 'That post could not be found');
  return post;
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<AdminPostDto> {
  await existing(id);
  const post = await prisma.blogPost.update({ where: { id }, data: input, include: WITH_AUTHOR });
  return toAdmin(post);
}

/**
 * Publish or take down. The first publication date is kept across an unpublish
 * and republish, so a corrected post does not jump to the top as if new.
 */
export async function setPublished(id: string, isPublished: boolean): Promise<AdminPostDto> {
  const current = await existing(id);
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      isPublished,
      ...(isPublished && !current.publishedAt && { publishedAt: new Date() }),
    },
    include: WITH_AUTHOR,
  });
  return toAdmin(post);
}
