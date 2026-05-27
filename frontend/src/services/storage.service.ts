import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   * This is abstracted to allow future migration to VaultSpace
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      upsert?: boolean;
      cacheControl?: string;
    }
  ): Promise<UploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? false,
        cacheControl: options?.cacheControl ?? '3600',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  },

  /**
   * Generate a unique file path
   */
  generateFilePath(prefix: string, fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const baseName = fileName.replace(`.${extension}`, '');
    return `${prefix}/${timestamp}-${randomString}-${baseName}.${extension}`;
  },
};
