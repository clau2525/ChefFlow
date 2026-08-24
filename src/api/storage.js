import { supabase } from '@/api/supabaseClient';

const BUCKET = 'recipe-images';

/**
 * Upload a recipe photo and return its public URL.
 * Scoped under the user's own id — the bucket policy only lets a signed-in
 * user write inside their own folder.
 */
export async function uploadImage(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be signed in to upload a photo.');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${user.id}/${crypto.randomUUID()}.${ext || 'jpg'}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
