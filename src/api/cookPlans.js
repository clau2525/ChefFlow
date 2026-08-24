import { supabase } from '@/api/supabaseClient';
import { unwrap, pick } from '@/api/helpers';

const TABLE = 'cook_plans';

const WRITABLE = ['recipe_id', 'status', 'planned_date'];

export async function listPlans({ status } = {}, limit = 100) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) query = query.eq('status', status);
  return unwrap(await query);
}

export async function getPlan(id) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', id).single());
}

export async function createPlan(data) {
  return unwrap(await supabase.from(TABLE).insert(pick(data, WRITABLE)).select().single());
}

export async function updatePlan(id, data) {
  return unwrap(
    await supabase.from(TABLE).update(pick(data, WRITABLE)).eq('id', id).select().single()
  );
}

export async function deletePlan(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
