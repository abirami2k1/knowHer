import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BlogPostInput } from '@shared/types';
import { useAuth } from '@/hooks/useAuth';
import {
  createPost,
  getAdminPosts,
  getBlog,
  getBlogPost,
  getKnowledge,
  setPublished,
  updatePost,
} from '@/lib/api/content';

export function useKnowledge() {
  const { status } = useAuth();
  return useQuery({ queryKey: ['knowledge'], queryFn: getKnowledge, enabled: status === 'authed' });
}

export function useBlog(audience: 'user' | 'supporter') {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['blog', audience],
    queryFn: () => getBlog(audience),
    enabled: status === 'authed',
  });
}

export function useBlogPost(slug: string) {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => getBlogPost(slug),
    enabled: status === 'authed',
    retry: false, // a 404 is an answer, not a blip
  });
}

export function useAdminPosts() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['admin-posts'],
    queryFn: getAdminPosts,
    enabled: status === 'authed',
  });
}

/** Any write changes what readers and authors see, so both caches are refreshed. */
function useRefreshContent() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    queryClient.invalidateQueries({ queryKey: ['blog'] });
  };
}

export function useSavePost() {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: ({ id, input }: { id: string | null; input: BlogPostInput }) =>
      id ? updatePost(id, input) : createPost(input),
    onSuccess: refresh,
  });
}

export function useSetPublished() {
  const refresh = useRefreshContent();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => setPublished(id, publish),
    onSuccess: refresh,
  });
}
