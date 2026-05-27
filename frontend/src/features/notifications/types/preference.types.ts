export const DeliveryMethod = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push',
  DIGEST: 'digest',
} as const;

export type DeliveryMethod = (typeof DeliveryMethod)[keyof typeof DeliveryMethod];

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  enabled: boolean;
  delivery_method: DeliveryMethod;
  created_at: string;
  updated_at: string;
}

export interface MuteSettings {
  workspace_id?: string;
  channel_id?: string;
  muted_until?: string;
  mute_notifications: boolean;
}

export interface UserNotificationSettings {
  preferences: NotificationPreference[];
  mute_settings: MuteSettings[];
}
