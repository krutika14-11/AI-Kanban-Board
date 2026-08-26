import { useState } from 'react';
import {
  Search, Database, Brain, ChevronDown, ChevronRight,
  Loader2, AlertCircle, FileText, Zap
} from 'lucide-react';
import { useRAGSearch } from '../../hooks/useAI';
import { RAGSearchResult } from '../../types';
import { cn } from '../../utils/cn';

interface RAGInspectorProps {
  retrievedDocs?: Array<{ title: string; category: string; score: number }>;
  projectGoal?: string;
  modelUsed?: string;
  executionTimeMs?: number;
  retryCount?: number;
  repaired?: boolean;
}

export function RAGInspector({
  retrievedDocs = [],
  projectGoal = '',
  modelUsed,
  executionTimeMs,
  retryCount,
  repaired,
}: RAGInspectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RAGSearchResult[]>([]);
  const ragSearch = useRAGSearch();

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    const results = await ragSearch.mutateAsync({ query: searchQuery, topK: 5 });
    setSearchResults(results);
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 border-b border-slate-800 cursor-pointer"
        onClick={() => setIsExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">RAG Inspector</span>
        </div>
        {modelUsed && (
          <span className="text-xs text-slate-500">{modelUsed}</span>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Pipeline overview */}
          <div>
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">RAG Pipeline</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {[
                { icon: Search, label: 'User Query', color: 'text-blue-400' },
                { icon: Zap, label: 'Embeddings', color: 'text-yellow-400' },
                { icon: Database, label: 'Vector Search', color: 'text-green-400' },
                { icon: FileText, label: 'Context', color: 'text-orange-400' },
                { icon: Brain, label: 'LLM', color: 'text-purple-400' },
              ].map(({ icon: Icon, label, color }, i, arr) => (
                <span key={label} className="flex items-center gap-1">
                  <Icon className={cn('w-3 h-3', color)} />
                  <span className="text-slate-300">{label}</span>
                  {i < arr.length - 1 && <span className="text-slate-600">→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          {(executionTimeMs !== undefined || retryCount !== undefined || repaired !== undefined) && (
            <div className="grid grid-cols-3 gap-3">
              {executionTimeMs !== undefined && (
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{(executionTimeMs / 1000).toFixed(1)}s</div>
                  <div className="text-xs text-slate-500">Execution Time</div>
                </div>
              )}
              {retryCount !== undefined && (
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{retryCount + 1}</div>
                  <div className="text-xs text-slate-500">Attempt{retryCount > 0 ? 's' : ''}</div>
                </div>
              )}
              {repaired !== undefined && (
                <div className={cn(
                  'rounded-lg p-3 text-center',
                  repaired ? 'bg-amber-900/30' : 'bg-green-900/30'
                )}>
                  <div className={cn('text-lg font-bold', repaired ? 'text-amber-400' : 'text-green-400')}>
                    {repaired ? 'Repaired' : 'Valid'}
                  </div>
                  <div className="text-xs text-slate-500">JSON Status</div>
                </div>
              )}
            </div>
          )}

          {/* Retrieved documents */}
          {retrievedDocs.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
                Retrieved Knowledge ({retrievedDocs.length} documents)
              </p>
              <div className="space-y-2">
                {retrievedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-slate-200">{doc.title}</div>
                        <div className="text-xs text-slate-500">{doc.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-700 rounded-full">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${doc.score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{doc.score.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {retrievedDocs.length === 0 && !projectGoal && (
            <div className="text-center py-4 text-slate-500 text-sm">
              <Database className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No retrieval data yet. Generate an AI plan to see results.
            </div>
          )}

          {/* Interactive search */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
              Test Vector Search
            </p>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button
                onClick={handleSearch}
                disabled={ragSearch.isPending || !searchQuery.trim()}
                className="btn-secondary flex items-center gap-1.5 px-3 text-sm"
              >
                {ragSearch.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Search
              </button>
            </div>

            {ragSearch.isError && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Vector DB not available. Start Qdrant to enable semantic search.
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((result, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{result.payload.title}</span>
                      <span className="text-xs font-mono text-primary-400">{result.score.toFixed(3)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{result.payload.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
