'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Markdown({ children, style = {} }) {
  return (
    <div className="markdown-content" style={style}>
      <style>{`
        .markdown-content strong { font-weight: 700 !important; }
        .markdown-content em { font-style: italic; }
        .markdown-content del { text-decoration: line-through; }
        .markdown-content u { text-decoration: underline; }
        .markdown-content p { margin: 0; }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}