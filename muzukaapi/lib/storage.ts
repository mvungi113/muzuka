import { supabaseAdmin } from './supabase';

export interface StorageProvider {
  upload(bucket: string, path: string, file: File | Buffer): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
  getUrl(bucket: string, path: string): string;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
  exists(bucket: string, path: string): Promise<boolean>;
}

export class SupabaseStorageProvider implements StorageProvider {
  async upload(bucket: string, path: string, file: File | Buffer): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  getUrl(bucket: string, path: string): string {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Signed URL failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    try {
      await supabaseAdmin.storage
        .from(bucket)
        .download(path);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new SupabaseStorageProvider();

export const STORAGE_BUCKETS = {
  SONGS: 'songs',
  COVERS: 'covers',
  ARTIST_IMAGES: 'artist-images',
  ALBUM_IMAGES: 'album-images',
  AVATARS: 'avatars',
} as const;

export default storage;
