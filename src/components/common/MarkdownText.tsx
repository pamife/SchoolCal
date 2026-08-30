import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines to process lists, headers, and paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const renderInlineFormatted = (text: string, keyPrefix: string): React.ReactNode[] => {
    // Regex for bold (**bold**), code (`code`), and italic (*italic*)
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchedText = match[0];
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push(
          <strong key={`${keyPrefix}-b-${idx++}`} className="font-extrabold text-gray-950 dark:text-white">
            {matchedText.slice(2, -2)}
          </strong>
        );
      } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        parts.push(
          <code
            key={`${keyPrefix}-c-${idx++}`}
            className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/15 font-mono text-[12px]"
          >
            {matchedText.slice(1, -1)}
          </code>
        );
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        parts.push(
          <em key={`${keyPrefix}-i-${idx++}`} className="italic opacity-90">
            {matchedText.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1 list-none">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-ios-blue shrink-0 mt-1 select-none font-black text-[11px]">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-1 list-none">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-bold text-ios-blue shrink-0 select-none text-[11px]">{i + 1}.</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Unordered list item (• or * or -)
    const ulMatch = trimmed.match(/^([•\*\-]\s+)(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInlineFormatted(ulMatch[2], `line-${lineIdx}`));
      return;
    }

    // Ordered list item (1. or 2.)
    const olMatch = trimmed.match(/^(\d+[\.\)]\s+)(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInlineFormatted(olMatch[2], `line-${lineIdx}`));
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${lineIdx}`} className="text-sm font-extrabold text-gray-900 dark:text-white mt-3 mb-1">
          {renderInlineFormatted(trimmed.slice(4), `h3-${lineIdx}`)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${lineIdx}`} className="text-base font-extrabold text-gray-900 dark:text-white mt-3 mb-1">
          {renderInlineFormatted(trimmed.slice(3), `h2-${lineIdx}`)}
        </h3>
      );
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="my-1 leading-relaxed">
        {renderInlineFormatted(trimmed, `p-${lineIdx}`)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
