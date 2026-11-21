export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_UTF8_BYTES = 72;

// Match Java's UTF-16 length and BCrypt's UTF-8 byte limit without silently
// replacing malformed Unicode before the password reaches the backend.
export function getPasswordError(password) {
  if (typeof password !== 'string' || !password.trim()) return 'Enter a new password.';
  if (password.length < MIN_PASSWORD_LENGTH) return 'Use at least 6 characters.';
  for (let index = 0; index < password.length; index += 1) {
    const code = password.charCodeAt(index);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = password.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return 'Use valid text characters in your password.';
      index += 1;
    } else if (code >= 0xDC00 && code <= 0xDFFF) {
      return 'Use valid text characters in your password.';
    }
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_UTF8_BYTES) {
    return 'Use a shorter password (maximum 72 UTF-8 bytes).';
  }
  return '';
}

export function getConfirmationError(password, confirmation) {
  if (!confirmation) return 'Confirm your new password.';
  return password === confirmation ? '' : 'Passwords do not match.';
}

// Tokens are only read into component memory. Strip all query/fragment data
// from the reset URL immediately after mounting, before any user interaction.
export function readPasswordResetLink(href) {
  try {
    const url = new URL(href);
    const fragmentTokens = new URLSearchParams(url.hash.slice(1)).getAll('token');
    const queryTokens = url.searchParams.getAll('token');
    const tokens = [...fragmentTokens, ...queryTokens];
    return {
      token: tokens.length === 1 && /^[A-Za-z0-9_-]{43}$/.test(tokens[0]) ? tokens[0] : '',
      cleanUrl: url.pathname,
    };
  } catch {
    return { token: '', cleanUrl: '/reset-password' };
  }
}

export function recoveryRetryMessage(retryAfter, now = Date.now()) {
  const seconds = /^\d+$/.test(String(retryAfter ?? ''))
    ? Number(retryAfter)
    : Math.ceil((Date.parse(retryAfter) - now) / 1000);
  if (Number.isFinite(seconds) && seconds > 0) {
    const minutes = Math.max(1, Math.ceil(seconds / 60));
    return `Too many requests. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
  }
  return 'Too many requests. Please wait a few minutes before trying again.';
}
