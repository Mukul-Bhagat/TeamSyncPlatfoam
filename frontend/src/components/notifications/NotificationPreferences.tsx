import { useState } from 'react';
import { notificationPreferencesService } from '@/services/notification-preferences.service';
import { Bell, BellOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPreferencesProps {
  userId: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    message_mention: true,
    workspace_invite: true,
    deployment_alert: true,
    incident_alert: true,
    ai_summary: true,
    system_alert: true,
    activity_update: true,
  });

  const handleToggle = async (notificationType: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [notificationType]: enabled,
    }));

    try {
      if (enabled) {
        await notificationPreferencesService.enableNotificationType(userId, notificationType);
      } else {
        await notificationPreferencesService.disableNotificationType(userId, notificationType);
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Revert on error
      setPreferences((prev) => ({
        ...prev,
        [notificationType]: !enabled,
      }));
    }
  };

  const notificationTypes = [
    { type: 'message_mention', label: 'Message Mentions', description: 'When someone mentions you in a message' },
    { type: 'workspace_invite', label: 'Workspace Invites', description: 'When someone invites you to a workspace' },
    { type: 'deployment_alert', label: 'Deployment Alerts', description: 'When deployments succeed or fail' },
    { type: 'incident_alert', label: 'Incident Alerts', description: 'When incidents are opened or updated' },
    { type: 'ai_summary', label: 'AI Summaries', description: 'When AI generates summaries' },
    { type: 'system_alert', label: 'System Alerts', description: 'Important system notifications' },
    { type: 'activity_update', label: 'Activity Updates', description: 'General activity notifications' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-glass-border">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
      </div>

      {/* Preferences List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {notificationTypes.map((item) => (
            <div
              key={item.type}
              className="flex items-start justify-between p-4 rounded-lg bg-glass border border-glass-border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{item.label}</h3>
                  {preferences[item.type] ? (
                    <Bell className="w-4 h-4 text-success" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle(item.type, !preferences[item.type])}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  preferences[item.type] ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    preferences[item.type] ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Mute Settings Section */}
        <div className="mt-8 pt-6 border-t border-glass-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Mute Settings</h3>
          <div className="p-4 rounded-lg bg-glass border border-glass-border">
            <p className="text-sm text-muted-foreground">
              Mute settings allow you to temporarily disable notifications for specific workspaces or channels.
            </p>
            <button className="mt-3 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Configure Mute Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
