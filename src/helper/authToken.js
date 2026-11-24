// Small helpers around the login token (a JWT). We only read its expiry here; the backend
// still verifies every token.

/** Reads the payload of a JWT without verifying it. Returns null if it is not a JWT. */
function readPayload(token) {
  try {
    const part = String(token).split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const json = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True when the token is missing, unreadable or past its expiry (with a small safety margin). */
export function isTokenExpired(token, marginSeconds = 30) {
  if (!token) return true;
  const payload = readPayload(token);
  if (!payload) return true;
  if (!payload.exp) return false; // token without expiry
  return payload.exp * 1000 <= Date.now() + marginSeconds * 1000;
}

/** Removes the stored session (both keys the app uses). */
export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
  } catch {
    // storage blocked: nothing to clear
  }
}

/** Requests whose 401 means "wrong login details", not "session expired". */
// (login, register, OTP, password reset for customers/repairmen and /seller/auth/...; not user-details)
export const isAuthEndpoint = (url = '') =>
  /\/auth\/(?!user-details)/.test(url) || /\/login\b/.test(url);
