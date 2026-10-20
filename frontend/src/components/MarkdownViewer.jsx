
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export default function MarkdownViewer({ content }) {
  if (!content) {
    return (
      <p className="text-slate-400 italic text-sm">
        No content provided.
      </p>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-indigo prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Style the existing pre element for code blocks
          pre({ children, ...props }) {
            return (
              <pre
                className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 my-4"
                {...props}
              >
                {children}
              </pre>
            );
          },

          // Render inline code and fenced-block code correctly
          code({ className, children, ...props }) {
            const isBlock = Boolean(className?.includes("language-"));

            return isBlock ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
