import { supabase } from '@/lib/supabase';
import type { Profile, UpdateProfileInput } from '@/features/profile/types/profile.types';

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    return this.getProfile(user.id);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateCurrentProfile(input: UpdateProfileInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    return this.updateProfile(user.id, input);
  },

  async updateUsername(userId: string, username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async checkUsernameAvailability(username: string) {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned - username is available
      return true;
    }

    if (error) throw error;

    // Username exists
    return false;
  },
};
