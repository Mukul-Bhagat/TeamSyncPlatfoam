import { useState } from 'react';
import {
  Plug,
  Activity,
  Webhook,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Copy,
  RefreshCw,
  Server,
  Brain,
  GitBranch,
  ShieldAlert,
  LayoutDashboard,
  HeartPulse,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useIntegrations,
  useEventLogs,
  useEventStats,
} from '@/features/integrations/hooks/useIntegrations';
import type { IntegrationHealthStatus } from '@/features/integrations/types/integration.types';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';

type Tab = 'overview' | 'connected' | 'webhooks' | 'logs';

const ECOSYSTEM_APPS = [
  { name: 'deployhub', displayName: 'DeployHub', description: 'Deployment orchestration', icon: Server, category: 'deployment' },
  { name: 'pipevista', displayName: 'PipeVista', description: 'CI/CD pipeline management', icon: GitBranch, category: 'deployment' },
  { name: 'insightai', displayName: 'InsightAI', description: 'AI summaries & insights', icon: Brain, category: 'ai' },
  { name: 'incidentos', displayName: 'IncidentOS', description: 'Incident management', icon: ShieldAlert, category: 'incident' },
  { name: 'flowboard', displayName: 'FlowBoard', description: 'Project flow tracking', icon: LayoutDashboard, category: 'project' },
  { name: 'devpulse', displayName: 'DevPulse', description: 'Dev health metrics', icon: HeartPulse, category: 'analytics' },
];

function StatusBadge({ status }: { status: IntegrationHealthStatus }) {
  const styles = {
    healthy: 'bg-emerald-500/10 text-emerald-500',
    degraded: 'bg-amber-500/10 text-amber-500',
    unhealthy: 'bg-red-500/10 text-red-500',
    unknown: 'bg-muted text-muted-foreground',
  };

  const icons = {
    healthy: <CheckCircle2 className="h-3 w-3" />,
    degraded: <AlertTriangle className="h-3 w-3" />,
    unhealthy: <XCircle className="h-3 w-3" />,
    unknown: <Loader2 className="h-3 w-3 animate-spin" />,
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', styles[status])}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: 'info' | 'warning' | 'critical' }) {
  const styles = {
    info: 'bg-blue-500/10 text-blue-500',
    warning: 'bg-amber-500/10 text-amber-500',
    critical: 'bg-red-500/10 text-red-500',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles[severity])}>
      {severity}
    </span>
  );
}

export function IntegrationCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [eventFilter, setEventFilter] = useState<string>('all');
  
  // Get real organizationId from organizations
  const { data: organizations } = useOrganizations();
  const organizationId = organizations?.[0]?.organization_id || '';

  const { data: integrations, isLoading: integrationsLoading } = useIntegrations(organizationId);
  const { data: eventLogs, isLoading: logsLoading } = useEventLogs(organizationId, { limit: 50 });
  const { data: stats } = useEventStats(organizationId);

  const connectedNames = new Set(integrations?.map((i) => i.integration_name) || []);

  const tabs: { id: Tab; label: string; icon: typeof Plug }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'connected', label: 'Connected Apps', icon: Plug },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'logs', label: 'Event Logs', icon: ClipboardList },
  ];

  const filteredLogs = eventLogs
    ? eventFilter === 'all'
      ? eventLogs
      : eventLogs.filter((e) => e.source_app === eventFilter || e.severity === eventFilter)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-glass-border bg-card/50 backdrop-blur-glass-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Plug className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">Integration Center</h1>
              <p className="text-sm text-muted-foreground">Manage ecosystem app connections and monitor event streams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-glass-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border rounded-xl p-5 shadow-soft-sm">
                <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                <p className="font-heading text-3xl font-bold text-foreground">{stats?.total_events ?? 0}</p>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-soft-sm">
                <p className="text-sm text-muted-foreground mb-1">Connected Apps</p>
                <p className="font-heading text-3xl font-bold text-foreground">{connectedNames.size}</p>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-soft-sm">
                <p className="text-sm text-muted-foreground mb-1">Critical Events</p>
                <p className="font-heading text-3xl font-bold text-red-500">{stats?.recent_critical?.length ?? 0}</p>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-soft-sm">
                <p className="text-sm text-muted-foreground mb-1">Event Sources</p>
                <p className="font-heading text-3xl font-bold text-foreground">
                  {Object.keys(stats?.by_source_app ?? {}).length}
                </p>
              </div>
            </div>

            {/* App Grid */}
            <div>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Ecosystem Apps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ECOSYSTEM_APPS.map((app) => {
                  const connected = connectedNames.has(app.name);
                  return (
                    <div
                      key={app.name}
                      className={cn(
                        'bg-card border rounded-xl p-5 shadow-soft-sm transition-all hover:shadow-soft-md',
                        connected && 'border-primary/30'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <app.icon className="h-5 w-5 text-primary" />
                        </div>
                        {connected ? (
                          <StatusBadge status="healthy" />
                        ) : (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Not connected</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{app.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connected' && (
          <div className="space-y-6">
            {integrationsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : !integrations || integrations.length === 0 ? (
              <EmptyState
                title="No integrations connected"
                description="Connect ecosystem apps to start receiving events"
              />
            ) : (
              <div className="bg-card border rounded-xl shadow-soft-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Plug className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground capitalize">
                            {integration.integration_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {integration.enabled ? 'Enabled' : 'Disabled'}
                            {integration.last_heartbeat && ` · Last heartbeat ${new Date(integration.last_heartbeat).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={integration.health_status} />
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            {integrationsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : !integrations || integrations.length === 0 ? (
              <EmptyState
                title="No webhook configurations"
                description="Add an integration to configure webhook endpoints"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="bg-card border rounded-xl p-5 shadow-soft-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground capitalize">{integration.integration_name}</h3>
                      <StatusBadge status={integration.health_status} />
                    </div>
                    {integration.webhook_url ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Webhook URL</p>
                          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                            <code className="text-xs text-foreground flex-1 truncate">{integration.webhook_url}</code>
                            <button
                              onClick={() => navigator.clipboard.writeText(integration.webhook_url!)}
                              className="p-1 rounded hover:bg-muted-foreground/10"
                              title="Copy URL"
                            >
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Secret: {integration.webhook_secret ? 'Configured' : 'Not set'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No webhook URL configured</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {['all', 'deployhub', 'pipevista', 'insightai', 'incidentos', 'critical'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setEventFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg transition-colors',
                    eventFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-glass text-muted-foreground hover:text-foreground'
                  )}
                >
                  {filter === 'all' ? 'All Sources' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {logsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : !filteredLogs || filteredLogs.length === 0 ? (
              <EmptyState title="No events yet" description="Events will appear here when ecosystem apps publish them" />
            ) : (
              <div className="bg-card border rounded-xl shadow-soft-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Source</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Event Type</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Severity</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLogs.map((event) => (
                        <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-foreground capitalize">{event.source_app}</span>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{event.event_type}</code>
                          </td>
                          <td className="px-4 py-3">
                            <SeverityBadge severity={event.severity} />
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
