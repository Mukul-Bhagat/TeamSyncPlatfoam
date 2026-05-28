import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Save } from 'lucide-react';

interface TriggerConfigProps {
  workflowId: string;
  onSave: () => void;
}

export function TriggerConfig({ workflowId, onSave }: TriggerConfigProps) {
  const [triggerType, setTriggerType] = useState<'event' | 'schedule' | 'manual' | 'AI' | 'command'>('event');
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Call API to save trigger configuration
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Configuration</CardTitle>
        <CardDescription>Configure when this workflow should be triggered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="trigger-type">Trigger Type</Label>
          <Select value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
            <SelectTrigger id="trigger-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="AI">AI Insight</SelectItem>
              <SelectItem value="command">Command</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {triggerType === 'event' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Input
                id="event-type"
                placeholder="e.g., message.created, incident.updated"
                onChange={(e) => setConfig({ ...config, event_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-filter">Event Filter (optional)</Label>
              <Input
                id="event-filter"
                placeholder="e.g., channel_id=xxx"
                onChange={(e) => setConfig({ ...config, event_filter: e.target.value })}
              />
            </div>
          </div>
        )}

        {triggerType === 'schedule' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cron-expression">Cron Expression</Label>
              <Input
                id="cron-expression"
                placeholder="e.g., 0 * * * * (every hour)"
                onChange={(e) => setConfig({ ...config, cron_expression: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="e.g., UTC, America/New_York"
                defaultValue="UTC"
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
              />
            </div>
          </div>
        )}

        {triggerType === 'AI' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="insight-type">Insight Type</Label>
              <Input
                id="insight-type"
                placeholder="e.g., anomaly, trend, correlation"
                onChange={(e) => setConfig({ ...config, insight_type: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="anomaly-detection" />
              <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
            </div>
          </div>
        )}

        {triggerType === 'command' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="command-name">Command Name</Label>
              <Input
                id="command-name"
                placeholder="e.g., /deploy, /incident"
                onChange={(e) => setConfig({ ...config, command_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-capability">Required Capability (optional)</Label>
              <Input
                id="required-capability"
                placeholder="e.g., deploy.execute"
                onChange={(e) => setConfig({ ...config, required_capability: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Trigger'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
