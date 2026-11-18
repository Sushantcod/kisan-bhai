import React from 'react';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isUser = false }) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-medium text-white">{content}</p>;
  }

  // Parse inline markdown tokens: **bold**, *italic*, `code`, __bold__
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split text by markdown tokens
    const tokens = text.split(/(\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[\s\S]+?`|(?<!\*)\*[^*]+?\*(?!\*))/g);

    return tokens.map((part, idx) => {
      if (!part) return null;

      // 1. Bold (**text** or __text__)
      if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
          (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
        const inner = part.slice(2, -2).trim();
        return (
          <strong key={idx} className="font-extrabold text-slate-950 tracking-tight">
            {inner}
          </strong>
        );
      }

      // 2. Inline code (`code`)
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const inner = part.slice(1, -1);
        return (
          <code key={idx} className="bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded text-xs font-mono font-semibold border border-emerald-200/60">
            {inner}
          </code>
        );
      }

      // 3. Italic (*text*)
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        const inner = part.slice(1, -1).trim();
        return (
          <em key={idx} className="italic text-slate-800">
            {inner}
          </em>
        );
      }

      // 4. Clean plain text: eliminate any stray/unmatched markdown symbols (*, **, ###, __)
      const sanitized = part
        .replace(/\*\*/g, '')                     // strip stray **
        .replace(/##+/g, '')                      // strip stray ## or ###
        .replace(/(^|\s)\*(\s|$)/g, '$1$2')       // strip orphan standalone *
        .replace(/^[\*_~#]+|[\*_~#]+$/g, '');     // strip leading or trailing markdown symbols

      if (!sanitized) return null;
      return <span key={idx}>{sanitized}</span>;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 1. Headers: ### or ## or #
    if (line.startsWith('#')) {
      const headerText = line.replace(/^#+\s*/, '').trim();
      elements.push(
        <div 
          key={`header-${i}`} 
          className="font-heading font-extrabold text-xs sm:text-sm text-emerald-950 mt-3.5 mb-1.5 pb-1 border-b border-emerald-200/60 flex items-center gap-2"
        >
          <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full shrink-0" />
          <div className="flex-1">
            {renderInline(headerText)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 2. Horizontal divider: --- or *** or ___
    if (line === '---' || line === '***' || line === '___') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-t border-slate-200/80" />);
      i++;
      continue;
    }

    // 3. Bullet list item: * or - or •
    const bulletMatch = line.match(/^[*•\-]\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2 shadow-xs" />
          <div className="flex-1 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
            {renderInline(bulletMatch[1])}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 4. Numbered list item: 1. or 2)
    const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-0.5">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            {numMatch[1]}
          </span>
          <div className="flex-1 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
            {renderInline(numMatch[2])}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 5. Blockquote / Callout (> Note: ...)
    const quoteMatch = line.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      elements.push(
        <div key={`quote-${i}`} className="pl-3 py-1.5 my-2 border-l-2 border-emerald-500 bg-emerald-50/50 rounded-r-lg text-xs sm:text-sm text-emerald-950 font-medium">
          {renderInline(quoteMatch[1])}
        </div>
      );
      i++;
      continue;
    }

    // 6. Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed text-xs sm:text-sm font-medium text-slate-800 my-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
};
