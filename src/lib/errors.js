const OFFLINE = "Couldn't reach the server. Check your connection and try again.";

/**
 * A dropped request surfaces as "TypeError: Failed to fetch", which tells the
 * cook nothing. Anything that reads like a transport failure gets plain
 * language instead; real messages from Supabase (row-level security, a bad
 * column) are worth showing as-is.
 */
export function readableError(message) {
  if (!message) return OFFLINE;
  return /failed to fetch|networkerror|load failed|fetch failed/i.test(message)
    ? OFFLINE
    : message;
}
