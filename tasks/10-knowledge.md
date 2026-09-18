# Task 10 — Knowledge Tab + Admin Panel

**Goal:** the content home, plus a way for Sivi to publish.

## 10.1 Public content API
- `GET /knowledge` (articles), `GET /blog` (published posts), `GET /blog/:slug`.
- Audience filter so supporter content is browsable.

## 10.2 Knowledge UI (the "Learn" tab)
- Browse period basics / cycle education (KnowledgeArticle) and Sivi's blog posts.
- Sections: Basics · From Sivi · For Supporters. Markdown rendering. Mobile-first reading view.

## 10.3 Admin panel (role-gated)
- A protected role (author) — Sivi. Create/edit/publish BlogPost via markdown editor. Unpublish/draft states.
- Never exposes DB internals; simple, forgiving editor.

## Acceptance
- Readers browse articles + posts by section; an author account can create and publish a post that then appears publicly; non-authors cannot access the admin panel.
