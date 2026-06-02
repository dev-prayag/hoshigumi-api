import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './button';

export function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (text: string) => {
    if (language === 'json') {
      return text.replace(/(".*?"):/g, '<span class="text-cyan-400">$1</span>:')
                 .replace(/: (".*?")/g, ': <span class="text-emerald-400">$1</span>')
                 .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>')
                 .replace(/: ([0-9]+)/g, ': <span class="text-orange-400">$1</span>');
    }
    if (language === 'bash') {
      return text.replace(/(curl|GET|POST)/g, '<span class="text-cyan-400">$1</span>');
    }
    return text;
  };

  return (
    <div className="relative group rounded-lg bg-[#090b0f] border border-border overflow-hidden my-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#10141d]">
        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">{language}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopy} aria-label="Copy code">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-gray-300">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}
