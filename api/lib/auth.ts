import crypto from 'crypto';

export interface AdminSession {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

// Get JWT secret from environment or construct a runtime key
const getSecret = () => {
  return process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'bastanzi-ogfcargo-secure-jwt-key-2026';
};

/**
 * Generate a signed JWT-like token for admin sessions
 */
export function generateAdminToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  // Session token expires in 8 hours server-side (inactivity auto-logout is handled client-side)
  const exp = now + 8 * 3600;
  const payload = Buffer.from(JSON.stringify({ email, role: 'admin', iat: now, exp })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify authorization token from request headers or body.
 * Returns decoded AdminSession if valid, null if unauthenticated/expired.
 */
export function verifyAdminToken(tokenHeader: string | undefined | null): AdminSession | null {
  if (!tokenHeader) return null;

  const rawToken = tokenHeader.startsWith('Bearer ') ? tokenHeader.substring(7) : tokenHeader;
  const parts = rawToken.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Helper to check admin credentials securely against environment variables
 */
export function validateCredentials(emailInput: string, passwordInput: string): boolean {
  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@ogfcargo.com').trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!emailInput || !passwordInput) return false;

  const cleanEmail = emailInput.trim().toLowerCase();
  return cleanEmail === configuredEmail && passwordInput === configuredPassword;
}
