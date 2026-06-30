// Time-window impression deduplication — 30 min per campaign per browser
const IMPRESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Returns true and updates the timestamp if the impression should be counted.
 * Returns false if an impression for this campaign was already sent within the TTL window.
 *
 * @param {string} campaignId
 * @returns {boolean}
 */
export function shouldTrackImpression(campaignId) {
  if (typeof window === 'undefined') return false; // SSR guard
  try {
    const key      = `ad_imp_${campaignId}`;
    const stored   = localStorage.getItem(key);
    const now      = Date.now();

    if (stored) {
      const lastSeen = parseInt(stored, 10);
      if (!isNaN(lastSeen) && now - lastSeen < IMPRESSION_TTL_MS) {
        return false; // already counted within last 30 min
      }
    }

    localStorage.setItem(key, now.toString());
    return true;
  } catch {
    // localStorage blocked (private mode, quota, etc.) — allow impression
    return true;
  }
}

/**
 * Filter a list of campaignIds down to only those that haven't been
 * counted within the TTL window, and mark them as seen.
 *
 * @param {string[]} campaignIds
 * @returns {string[]} filtered ids ready to send
 */
export function filterFreshImpressions(campaignIds) {
  return campaignIds.filter(id => shouldTrackImpression(id));
}
