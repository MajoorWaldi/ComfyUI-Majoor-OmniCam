// Bounded replay-protection cache for Director API transaction ids.
//
// ui._directorApiTxIds previously grew forever across a long-lived Director
// session. This caps it at MAX_RECENT_TRANSACTION_IDS, evicting the oldest
// id once the cache is full (insertion order == recency, since a lookup
// bumps an id back to the end -- see rememberTransactionId).

export const MAX_RECENT_TRANSACTION_IDS = 2048;

export function rememberTransactionId(ui, id) {
  const cache = (ui._directorApiTxIds ||= new Set());
  if (cache.has(id)) cache.delete(id);
  cache.add(id);
  while (cache.size > MAX_RECENT_TRANSACTION_IDS) {
    cache.delete(cache.values().next().value);
  }
}

export function hasRecentTransactionId(ui, id) {
  return Boolean(ui._directorApiTxIds?.has(id));
}
