/**
 * Operations Center - Main observability dashboard
 * 
 * Provides a comprehensive view of system health, metrics, traces, alerts, and operational controls.
 * Inspired by Datadog, Grafana, and Kubernetes dashboards.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardSummary {
  systemHealth: {
    overall: string;
    overallScore: number;
    components: Record<string, { status: string; score: number }>;
  };
  metrics: {
    workflowExecutions: number;
    aiRequests: number;
    eventThroughput: number;
    searchQueries: number;
  };
  alerts: {
    active: number;
    critical: number;
    warning: number;
  };
  replays: {
    active: number;
    completed: number;
    failed: number;
  };
}

export default function OperationsCenter() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/observability/dashboard/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5" />;
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Operations Center</h1>
        <Button onClick={fetchSummary} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon(summary.systemHealth.overall)}
            System Health
            <Badge className={getHealthColor(summary.systemHealth.overall)}>
              {summary.systemHealth.overall.toUpperCase()} ({summary.systemHealth.overallScore}/100)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(summary.systemHealth.components).map(([name, health]) => (
              <div key={name} className="flex items-center gap-2 p-3 border rounded-lg">
                {getHealthIcon(health.status)}
                <div>
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-500">{health.score}/100</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workflow Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.metrics.workflowExecutions}</div>
            <p className="text-xs text-gray-500">Last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.metrics.aiRequests}</div>
            <p className="text-xs text-gray-500">Last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.metrics.eventThroughput}</div>
            <p className="text-xs text-gray-500">Last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.metrics.searchQueries}</div>
            <p className="text-xs text-gray-500">Last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Replays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
              <Badge variant="destructive">{summary.alerts.active}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Critical</span>
                <Badge variant="destructive">{summary.alerts.critical}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Warning</span>
                <Badge variant="secondary">{summary.alerts.warning}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Replay Jobs
              <Badge>{summary.replays.active} Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <Badge variant="default">{summary.replays.completed}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Failed</span>
                <Badge variant="destructive">{summary.replays.failed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="traces" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="dead-letters">Dead Letters</TabsTrigger>
          <TabsTrigger value="replays">Replays</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="traces" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Traces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Trace viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Metrics charts coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dead-letters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dead Letter Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Dead letter viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="replays" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Replay Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Replay job viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Alert incident viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
