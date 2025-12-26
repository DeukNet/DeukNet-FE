import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '../styles/MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img({ node, ...props }) {
            return (
              <img
                loading="lazy"
                {...props}
              />
            );
          },
          code({ node, className, children, ...props }: any) {
            const inline = !className;
            return inline ? (
              <code className="inline-code" {...props}>
                {children}
              </code>
            ) : (
              <code className={`block-code ${className || ''}`} {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, ...props }) {
            return (
              <a target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          h1({ node, children, ...props }) {
            return <h1 {...props}>{children}</h1>;
          },
          h2({ node, children, ...props }) {
            return <h2 {...props}>{children}</h2>;
          },
          h3({ node, children, ...props }) {
            return <h3 {...props}>{children}</h3>;
          },
          h4({ node, children, ...props }) {
            return <h4 {...props}>{children}</h4>;
          },
          ul({ node, children, ...props }) {
            return <ul {...props}>{children}</ul>;
          },
          ol({ node, children, ...props }) {
            return <ol {...props}>{children}</ol>;
          },
          blockquote({ node, children, ...props }) {
            return (
              <blockquote {...props}>
                {children}
              </blockquote>
            );
          },
          hr({ node, ...props }) {
            return <hr {...props} />;
          },
          table({ node, children, ...props }) {
            return (
              <div className="table-wrapper">
                <table {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ node, children, ...props }) {
            return <thead {...props}>{children}</thead>;
          },
          th({ node, children, ...props }) {
            return <th {...props}>{children}</th>;
          },
          td({ node, children, ...props }) {
            return <td {...props}>{children}</td>;
          },
          p({ node, children, ...props }) {
            return <p {...props}>{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
