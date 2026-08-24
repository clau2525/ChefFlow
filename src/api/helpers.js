// Shared plumbing for the table modules in this folder.

// Supabase returns { data, error } rather than throwing. Every call goes
// through here so a failed request surfaces as a real exception.
export const unwrap = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Keep only the columns a client is allowed to write.
 * Guards against handing Supabase the server-managed fields (id, user_id,
 * created_at, updated_at) that ride along when an existing row is
 * round-tripped through an edit form.
 */
export const pick = (data, writable) => {
  const row = {};
  for (const key of writable) {
    if (data[key] !== undefined) row[key] = data[key];
  }
  return row;
};
