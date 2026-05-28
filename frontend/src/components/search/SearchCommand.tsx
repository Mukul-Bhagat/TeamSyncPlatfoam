import { useState, useEffect, useCallback } from 'react';
import { useSearch } from '@/features/search/hooks/useSearch';
import { Search, X, ChevronRight, MessageSquare, AlertTriangle, Rocket, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/features/search/types/search.types';

interface SearchCommandProps {
  organizationId: string;
  workspaceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommand({ organizationId, workspaceId, isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: searchResults, isLoading } = useSearch(
    {
      query,
      organization_id: organizationId,
      workspace_id: workspaceId,
      limit: 10,
      use_semantic: true,
    },
    query.length >= 2
  );

  const results = searchResults?.results || [];

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'message':
        return MessageSquare;
      case 'incident':
        return AlertTriangle;
      case 'deployment':
        return Rocket;
      case 'summary':
        return FileText;
      default:
        return Search;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'message':
        return 'text-blue-500';
      case 'incident':
        return 'text-orange-500';
      case 'deployment':
        return 'text-green-500';
      case 'summary':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    console.log('Selected result:', result);
    // TODO: Navigate to the result
    onClose();
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.entity_type]) {
      acc[result.entity_type] = [];
    }
    acc[result.entity_type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, incidents, deployments, summaries..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && query.length >= 2 && (
            <div className="p-8 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="p-8 text-center text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length > 0 && (
            <div className="p-2">
              {Object.entries(groupedResults).map(([entityType, items]) => {
                const Icon = getEntityIcon(entityType);
                return (
                  <div key={entityType} className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Icon className={cn('h-3 w-3', getEntityColor(entityType))} />
                      {entityType}
                    </div>
                    {items.map((result, idx) => {
                      const globalIndex = results.indexOf(result);
                      const ResultIcon = getEntityIcon(result.entity_type);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={cn(
                            'w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                            globalIndex === selectedIndex ? 'bg-accent' : 'hover:bg-muted'
                          )}
                        >
                          <ResultIcon className={cn('h-4 w-4 mt-0.5', getEntityColor(result.entity_type))} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{result.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{result.content}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          {results.length > 0 && (
            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}
