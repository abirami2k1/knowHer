import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Article and post bodies. Author content is still untrusted input (architecture
 * §5b): raw HTML is never enabled, and rehype-sanitize strips anything outside
 * GitHub's safe subset — scripts, event handlers, javascript: links.
 *
 * Headings drop one level so a post's "# Title" never competes with the page's h1.
 */
const COMPONENTS: Components = {
  h1: ({ children }) => <h2 className="mt-8 font-display text-title text-ink">{children}</h2>,
  h2: ({ children }) => <h3 className="mt-7 font-display text-xl text-ink">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-6 font-semibold text-ink">{children}</h4>,
  p: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-5 border-l-2 border-primary-soft pl-4 text-ink-soft italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-line" />,
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="text-[17px] leading-[1.7] text-ink-soft">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={COMPONENTS}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
