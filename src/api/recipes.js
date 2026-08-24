import { supabase } from '@/api/supabaseClient';
import { unwrap, pick } from '@/api/helpers';

const TABLE = 'recipes';

const WRITABLE = [
  'title',
  'description',
  'image_url',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
  'ingredients',
  'steps',
  'tags',
  'notes',
  'source',
  'macros',
];

export async function listRecipes(limit = 200) {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit)
  );
}

export async function getRecipe(id) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', id).single());
}

/** Fetch several recipes at once — one round trip instead of one per id. */
export async function getRecipesByIds(ids) {
  if (ids.length === 0) return [];
  return unwrap(await supabase.from(TABLE).select('*').in('id', ids));
}

export async function createRecipe(data) {
  return unwrap(await supabase.from(TABLE).insert(pick(data, WRITABLE)).select().single());
}

export async function updateRecipe(id, data) {
  return unwrap(
    await supabase.from(TABLE).update(pick(data, WRITABLE)).eq('id', id).select().single()
  );
}

export async function deleteRecipe(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
