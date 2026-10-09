import type {
  AdminPostDto,
  BlogPostDto,
  BlogPostInput,
  BlogPostSummary,
  KnowledgeArticleDto,
} from '@shared/types';
import { apiFetch } from './client';

export function getKnowledge(): Promise<KnowledgeArticleDto[]> {
  return apiFetch<KnowledgeArticleDto[]>('/knowledge');
}

/** Published posts for a reader section; 'both' posts appear in either. */
export function getBlog(audience: 'user' | 'supporter'): Promise<BlogPostSummary[]> {
  return apiFetch<BlogPostSummary[]>(`/blog?audience=${audience}`);
}

export function getBlogPost(slug: string): Promise<BlogPostDto> {
  return apiFetch<BlogPostDto>(`/blog/${encodeURIComponent(slug)}`);
}

// ── Author only ──────────────────────────────────────────────────────────────

export function getAdminPosts(): Promise<AdminPostDto[]> {
  return apiFetch<AdminPostDto[]>('/admin/posts');
}

export function createPost(input: BlogPostInput): Promise<AdminPostDto> {
  return apiFetch<AdminPostDto>('/blog', { method: 'POST', body: JSON.stringify(input) });
}

export function updatePost(id: string, input: BlogPostInput): Promise<AdminPostDto> {
  return apiFetch<AdminPostDto>(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function setPublished(id: string, publish: boolean): Promise<AdminPostDto> {
  return apiFetch<AdminPostDto>(`/blog/${id}/${publish ? 'publish' : 'unpublish'}`, {
    method: 'POST',
  });
}
