import { useEffect, useState } from 'react';
import { useWorkflowExecution } from '../../hooks/useWorkflows';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { X, RefreshCw, CheckCircle, XCircle, Clock, Play, AlertCircle } from 'lucide-react';
import type { WorkflowExecution, WorkflowAction } from '../../types/workflows';

interface ExecutionTimelineProps {
  executionId: string;
  onClose: () => void;
}

export function ExecutionTimeline({ executionId, onClose }: ExecutionTimelineProps) {
  const { execution, loading, error, cancelExecution, reload } = useWorkflowExecution(executionId);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (execution) {
      loadActions();
    }
  }, [execution]);

  const loadActions = async () => {
    // TODO: Load actions from API
    setActions([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    await loadActions();
    setRefreshing(false);
  };

  const handleCancel = async () => {
    await cancelExecution();
    await handleRefresh();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading execution...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!execution) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Execution not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Execution Timeline</CardTitle>
            <CardDescription>
              {execution.id} · {new Date(execution.created_at).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {execution.status === 'running' && (
              <Button size="sm" variant="destructive" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(execution.status)}`} />
          <Badge variant="outline">{execution.status.toUpperCase()}</Badge>
          {execution.started_at && (
            <span className="text-sm text-muted-foreground">
              Started: {new Date(execution.started_at).toLocaleString()}
            </span>
          )}
          {execution.completed_at && (
            <span className="text-sm text-muted-foreground">
              Completed: {new Date(execution.completed_at).toLocaleString()}
            </span>
          )}
        </div>

        {execution.error_message && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive font-medium mb-1">
              <AlertCircle className="h-4 w-4" />
              Error
            </div>
            <p className="text-sm text-destructive/80">{execution.error_message}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="font-medium">Action Progression</h3>
          {actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              No actions recorded yet
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {actions.map((action, index) => (
                  <div key={action.id} className="relative flex gap-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                      {getStatusIcon(action.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{action.action_type}</h4>
                        <Badge variant="outline">{action.status}</Badge>
                      </div>
                      {action.started_at && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(action.started_at).toLocaleString()}
                        </p>
                      )}
                      {action.error_message && (
                        <p className="text-sm text-destructive">{action.error_message}</p>
                      )}
                      {action.result && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View result
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(action.result, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        {execution.execution_context && Object.keys(execution.execution_context).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Execution Context</h3>
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View metadata
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(execution.execution_context, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
