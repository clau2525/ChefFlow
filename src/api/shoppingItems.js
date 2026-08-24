import { supabase } from '@/api/supabaseClient';
import { unwrap, pick } from '@/api/helpers';

const TABLE = 'shopping_items';

const WRITABLE = [
  'name',
  'quantity',
  'unit',
  'category',
  'checked',
  'recipe_ids',
  'recipe_titles',
];

export async function listShoppingItems(limit = 500) {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit)
  );
}

export async function createShoppingItem(data) {
  return unwrap(await supabase.from(TABLE).insert(pick(data, WRITABLE)).select().single());
}

export async function updateShoppingItem(id, data) {
  return unwrap(
    await supabase.from(TABLE).update(pick(data, WRITABLE)).eq('id', id).select().single()
  );
}

export async function deleteShoppingItem(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Remove several rows in one round trip (used by "Clear checked"). */
export async function deleteShoppingItems(ids) {
  if (ids.length === 0) return;
  const { error } = await supabase.from(TABLE).delete().in('id', ids);
  if (error) throw new Error(error.message);
}
