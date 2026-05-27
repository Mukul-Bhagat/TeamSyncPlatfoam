export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}
