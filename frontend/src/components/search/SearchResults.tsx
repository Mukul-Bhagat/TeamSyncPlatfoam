import type { SearchResult } from '@/features/search/types/search.types';
import { MessageResult } from './MessageResult';
import { IncidentResult } from './IncidentResult';
import { DeploymentResult } from './DeploymentResult';
import { SummaryResult } from './SummaryResult';

interface SearchResultsProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
}

export function SearchResults({ results, onSelectResult }: SearchResultsProps) {
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.entity_type]) {
      acc[result.entity_type] = [];
    }
    acc[result.entity_type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const entityOrder = ['incident', 'deployment', 'summary', 'message', 'activity', 'workspace', 'channel'];

  return (
    <div className="space-y-4">
      {entityOrder
        .filter((entityType) => groupedResults[entityType])
        .map((entityType) => (
          <div key={entityType}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {entityType}
            </h3>
            <div className="space-y-2">
              {groupedResults[entityType].map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onSelect={onSelectResult}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function SearchResultItem({ result, onSelect }: { result: SearchResult; onSelect: (result: SearchResult) => void }) {
  switch (result.entity_type) {
    case 'message':
      return <MessageResult result={result} onSelect={onSelect} />;
    case 'incident':
      return <IncidentResult result={result} onSelect={onSelect} />;
    case 'deployment':
      return <DeploymentResult result={result} onSelect={onSelect} />;
    case 'summary':
      return <SummaryResult result={result} onSelect={onSelect} />;
    default:
      return <DefaultResult result={result} onSelect={onSelect} />;
  }
}

function DefaultResult({ result, onSelect }: { result: SearchResult; onSelect: (result: SearchResult) => void }) {
  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
    >
      <div className="font-medium text-sm">{result.title}</div>
      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.content}</div>
    </button>
  );
}
