import { useState } from 'react';
import { useMemories, useMemorySearch } from '@/features/search/hooks/useSearch';
import { Brain, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MemoryType } from '@/features/search/types/search.types';
import { DeploymentPatternCard } from './DeploymentPatternCard';
import { IncidentMemoryCard } from './IncidentMemoryCard';
import { OperationalMemoryCard } from './OperationalMemoryCard';

interface MemoryPanelProps {
  organizationId: string;
  workspaceId?: string;
}

export function MemoryPanel({ organizationId, workspaceId }: MemoryPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [filterType, setFilterType] = useState<MemoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: memories, isLoading } = useMemories({
    organization_id: organizationId,
    workspace_id: workspaceId,
    memory_type: filterType === 'all' ? undefined : filterType,
    limit: 20,
  });

  const { data: searchResults, isLoading: searchLoading } = useMemorySearch(
    searchQuery,
    organizationId,
    workspaceId,
    10
  );

  const displayMemories = searchQuery ? searchResults : memories?.memories || [];

  const getMemoryColor = (type: MemoryType) => {
    switch (type) {
      case 'important_incident':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'deployment_pattern':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'operational_decision':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'recurring_issue':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'ai_generated_memory':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Operational Memory</span>
          {displayMemories.length > 0 && (
            <span className="text-xs text-muted-foreground">({displayMemories.length})</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MemoryType | 'all')}
              className="px-2 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="important_incident">Incidents</option>
              <option value="deployment_pattern">Deployments</option>
              <option value="operational_decision">Decisions</option>
              <option value="recurring_issue">Issues</option>
              <option value="ai_generated_memory">AI Insights</option>
            </select>
          </div>

          {/* Memory List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading || searchLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading memories...
              </div>
            ) : displayMemories.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {searchQuery ? 'No memories found' : 'No operational memories yet'}
              </div>
            ) : (
              displayMemories.map((memory) => {
                switch (memory.memory_type) {
                  case 'deployment_pattern':
                    return <DeploymentPatternCard key={memory.id} memory={memory} />;
                  case 'important_incident':
                  case 'recurring_issue':
                    return <IncidentMemoryCard key={memory.id} memory={memory} />;
                  case 'operational_decision':
                  case 'ai_generated_memory':
                    return <OperationalMemoryCard key={memory.id} memory={memory} />;
                  default:
                    return <DefaultMemoryCard key={memory.id} memory={memory} />;
                }
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultMemoryCard({ memory }: { memory: any }) {
  return (
    <div className="p-3 bg-card border rounded-lg">
      <div className="font-medium text-sm">{memory.title}</div>
      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.content}</div>
    </div>
  );
}
