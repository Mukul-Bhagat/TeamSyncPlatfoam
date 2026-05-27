import { supabase } from '@/lib/supabase';
import type { NotificationPreference, DeliveryMethod, MuteSettings } from '@/features/notifications/types/preference.types';

export class NotificationPreferencesService {
  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async getPreference(userId: string, notificationType: string, deliveryMethod: DeliveryMethod): Promise<NotificationPreference | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', notificationType)
      .eq('delivery_method', deliveryMethod)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async updatePreference(userId: string, notificationType: string, deliveryMethod: DeliveryMethod, enabled: boolean): Promise<NotificationPreference> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        notification_type: notificationType,
        delivery_method: deliveryMethod,
        enabled,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async setMuteSettings(_userId: string, settings: MuteSettings): Promise<void> {
    // This would be stored in a separate mute_settings table
    // For now, we'll implement the foundation
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: _userId,
        notification_type: 'all',
        delivery_method: 'in_app',
        enabled: !settings.mute_notifications,
      });

    if (error) throw error;
  }

  async getMuteSettings(_userId: string): Promise<MuteSettings[]> {
    // This would query a separate mute_settings table
    // For now, return empty array as foundation
    return [];
  }

  async enableNotificationType(userId: string, notificationType: string): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        notification_type: notificationType,
        delivery_method: 'in_app',
        enabled: true,
      });

    if (error) throw error;
  }

  async disableNotificationType(userId: string, notificationType: string): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        notification_type: notificationType,
        delivery_method: 'in_app',
        enabled: false,
      });

    if (error) throw error;
  }

  async isNotificationEnabled(userId: string, notificationType: string, deliveryMethod: DeliveryMethod = 'in_app'): Promise<boolean> {
    const preference = await this.getPreference(userId, notificationType, deliveryMethod);
    return preference?.enabled ?? true; // Default to enabled
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
