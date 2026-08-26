import { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronRight, Code2, CheckCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface JSONViewerProps {
  data: unknown;
  title?: string;
  compact?: boolean;
}

export function JSONViewer({ data, title = 'JSON Output', compact = false }: JSONViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const jsonString = JSON.stringify(data, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 border-b border-slate-800 cursor-pointer"
        onClick={() => setIsExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <Code2 className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-xs text-slate-500">{jsonString.length.toLocaleString()} chars</span>
        </div>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
              copied
                ? 'bg-green-900/40 text-green-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
            <SyntaxHighlight json={jsonString} />
          </pre>
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ json }: { json: string }) {
  // Simple syntax highlighting
  const highlighted = json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
      let cls = 'text-green-400'; // string
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-300'; // key
        } else {
          cls = 'text-amber-300'; // string value
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-slate-500'; // null
      } else {
        cls = 'text-cyan-400'; // number
      }
      return `<span class="${cls}">${match}</span>`;
    });

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
