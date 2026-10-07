import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { securityManager } from './securityManager';

// Extend Express Request interface to hold authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
    customerId?: string;
    registrationId?: string;
    phone?: string;
    [key: string]: any;
  };
  sessionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELMET v8 SECURITY HEADERS MIDDLEWARE
// Docs: https://helmetjs.github.io/
//
// This backend is a pure REST/WebSocket API server.
// It does NOT serve HTML pages. CSP is set defensively:
//   - Restricts what can be embedded/executed if any HTML is ever returned
//   - Does NOT break API JSON responses
//   - Allows only the specific external domains actually used
//   - Never uses wildcard (*) default-src
//
// External resources actually required by this backend:
//   - Cloudinary (res.cloudinary.com, api.cloudinary.com) — image CDN & upload API
//   - Razorpay (api.razorpay.com) — payment gateway
//   - Redis (effect-bike-monumental-*.db.redis.io) — server-to-server only (no CSP needed)
//   - MongoDB Atlas — server-to-server only (no CSP needed)
//   - Google Fonts — only if frontend HTML is served
//   - OpenStreetMap tiles — only for frontend map rendering
//   - ficapp.in — Connect App frontend/API origins
// ─────────────────────────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ──────────────────────────────────────────────────
// For a pure API backend, CSP is primarily a defense-in-depth header.
// We set it tightly but allow the known legitimate external origins.
const cspDirectives = {
  // No default fallback to * — everything must be explicit
  defaultSrc: ["'self'"],

  // Scripts: only self + Google reCAPTCHA (used on frontend pages)
  // NOTE: 'unsafe-inline' is here only for legacy frontend compatibility.
  //       Remove it if your frontends move to nonce-based CSP.
  scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com', 'https://checkout.razorpay.com'],

  // Styles: self + Google Fonts
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],

  // Images: self + Cloudinary CDN (product/vendor images) + map tiles + Unsplash (placeholder images)
  imgSrc: [
    "'self'",
    'data:',
    'blob:',
    'https://res.cloudinary.com',       // Cloudinary CDN served images
    'https://*.cloudinary.com',          // Cloudinary subdomains
    'https://images.unsplash.com',       // Demo/placeholder images
    'https://*.openstreetmap.org',        // Map tiles
    'https://tile.openstreetmap.org',
  ],

  // Fonts: self + Google Fonts CDN
  fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],

  // Connect (XHR/fetch/WebSocket): self + all known Connect App API/WS endpoints + Cloudinary upload API + Razorpay
  connectSrc: [
    "'self'",
    // Production API and frontend domains
    'https://api.ficapp.in',
    'wss://api.ficapp.in',
    'https://ficapp.in',
    'https://www.ficapp.in',
    'https://*.ficapp.in',
    'wss://*.ficapp.in',
    // Cloudinary upload API (used server-side, included for completeness)
    'https://api.cloudinary.com',
    // Razorpay payment API
    'https://api.razorpay.com',
    'https://lumberjack.razorpay.com',
    // Local development
    'http://localhost:*',
    'ws://localhost:*',
    // WebSocket wildcard only as a last resort for other WS connections
    'wss://*',
  ],

  // Frames: block all embedding of this API server in iframes (clickjacking protection)
  frameAncestors: ["'none'"],
  frameSrc: ["'none'"],

  // Objects: no Flash, no plugins
  objectSrc: ["'none'"],

  // Media: no audio/video embedding from external sources
  mediaSrc: ["'self'"],

  // Forms: only submit to self
  formAction: ["'self'"],

  // Base URI: lock to self to prevent base tag injection
  baseUri: ["'self'"],

  // Upgrade HTTP to HTTPS in production only
  ...(IS_PRODUCTION ? { upgradeInsecureRequests: [] } : {}),
};

// ─── Main Helmet Middleware ────────────────────────────────────────────────────
export const helmetSecurityMiddleware = helmet({
  // ── Content Security Policy ──────────────────────────────────────────────
  contentSecurityPolicy: {
    directives: cspDirectives,
    // Use report-only in staging if you want to test CSP without blocking:
    // reportOnly: !IS_PRODUCTION,
  },

  // ── Strict-Transport-Security (HSTS) ────────────────────────────────────
  // Only enable HSTS on production where HTTPS is guaranteed.
  // Local development must NOT be forced into HTTPS.
  // maxAge: 1 year (31,536,000 seconds) — OWASP recommended minimum
  // includeSubDomains: protects all subdomains of ficapp.in
  // preload: intentionally NOT set — only add after confirming domain is ready for HSTS preload list
  strictTransportSecurity: IS_PRODUCTION
    ? {
        maxAge: 31_536_000,       // 1 year in seconds
        includeSubDomains: true,  // Protect all subdomains
        preload: false            // Do NOT preload without explicit readiness check
      }
    : false,                      // Disabled in development (local HTTP works normally)

  // ── X-Content-Type-Options ───────────────────────────────────────────────
  // Prevents browsers from MIME-sniffing responses away from the declared Content-Type.
  // Helmet v8: use xContentTypeOptions (formerly noSniff / contentTypeOptions)
  xContentTypeOptions: true,

  // ── X-Frame-Options ──────────────────────────────────────────────────────
  // Redundant with CSP frameAncestors: none, but kept for older browser compatibility.
  frameguard: { action: 'deny' },

  // ── Referrer-Policy ──────────────────────────────────────────────────────
  // Do not leak the full URL in Referer headers to external sites.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // ── X-DNS-Prefetch-Control ───────────────────────────────────────────────
  // Prevent browser DNS prefetching to avoid information leakage.
  dnsPrefetchControl: { allow: false },

  // ── X-Download-Options ───────────────────────────────────────────────────
  // Prevent IE from executing downloads in the context of this site.
  ieNoOpen: true,

  // ── X-Permitted-Cross-Domain-Policies ────────────────────────────────────
  // Disallow Adobe Flash and Acrobat from loading cross-domain data.
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // ── Cross-Origin-Opener-Policy ───────────────────────────────────────────
  // Isolates the browsing context to prevent cross-origin attacks.
  // 'same-origin' is safer but may break OAuth popups — use 'same-origin-allow-popups' if needed.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

  // ── Cross-Origin-Resource-Policy ─────────────────────────────────────────
  // Allow cross-origin requests since this is a public API backend.
  // 'cross-origin' is required for frontends on different domains to consume the API.
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // ── Cross-Origin-Embedder-Policy ─────────────────────────────────────────
  // Disabled: enabling 'require-corp' would break API responses consumed by
  // frontends that load Cloudinary images and other cross-origin resources
  // without explicit CORP headers on those resources.
  crossOriginEmbedderPolicy: false,

  // ── Origin-Agent-Cluster ─────────────────────────────────────────────────
  // Enables origin-keyed agent clusters for better process isolation.
  originAgentCluster: true,

  // ── X-Powered-By ─────────────────────────────────────────────────────────
  // NOTE: hidePoweredBy was removed in Helmet v7+.
  // Use app.disable('x-powered-by') in Express instead (done in index.ts).
});

// Client IP resolution helper for robust reverse proxy handling
export const resolveClientIp = (req: Request): string => {
  const forwarded = req.headers['forwarded'];
  if (typeof forwarded === 'string') {
    const match = forwarded.match(/for="?([^;,"]+)/i);
    if (match && match[1]) return match[1].trim();
  }
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    const parts = xForwardedFor.split(',');
    if (parts[0]) return parts[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

// 1. Global API Rate Limiter (500 requests / 15 min -> HTTP 429)
export const globalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  keyGenerator: (req: Request) => resolveClientIp(req),
  validate: { xForwardedForHeader: false, forwardedHeader: false, default: true },
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please slow down.'
  }
});

// 2. Auth & OTP Rate Limiter (30 requests / min -> HTTP 429)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 30, // 30 requests max per minute
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  keyGenerator: (req: Request) => resolveClientIp(req),
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    default: true,
  },
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait 1 minute before trying again.'
  }
});

// 2b. Payment & Wallet Rate Limiter (15 requests / min -> HTTP 429)
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  keyGenerator: (req: Request) => resolveClientIp(req),
  validate: { xForwardedForHeader: false, forwardedHeader: false, default: true },
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Payment request rate limit reached. Please wait 1 minute before trying again.'
  }
});

// 2c. File Upload Rate Limiter (20 uploads / 5 min -> HTTP 429)
export const uploadRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  keyGenerator: (req: Request) => resolveClientIp(req),
  validate: { xForwardedForHeader: false, forwardedHeader: false, default: true },
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Upload rate limit reached. Please wait a few minutes before trying again.'
  }
});

// CORS Trusted Origin Validation
export const TRUSTED_ORIGINS = [
  'https://ficapp.in',
  'https://www.ficapp.in',
  'https://api.ficapp.in'
];

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return false;
  if (TRUSTED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.ficapp.in')) return true;
  if (!IS_PRODUCTION) {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }
  return false;
};

export const corsSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Non-browser / same-origin requests
    res.setHeader('Access-Control-Allow-Origin', TRUSTED_ORIGINS[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Headers', (Array.isArray(reqHeaders) ? reqHeaders.join(',') : reqHeaders) || 'x-auth-token, Content-Type, Authorization, Cache-Control, Pragma, Expires, expires, x-requested-with, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
};

// 3. Input Sanitizer Middleware (XSS, SQL Injection & Mongo Injection protection)
export const sanitizeValue = (val: any): any => {
  if (typeof val === 'string') {
    if (val.startsWith('data:') && val.includes(';base64,')) {
      return val;
    }
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/(?:--|\/\*|\*\/|xp_|;\s*drop\b|;\s*truncate\b)/gi, '') // Strip SQL injection tokens
      .replace(/\$(?:gt|gte|lt|lte|ne|in|nin|exists|regex|where|expr|or|and)/gi, ''); // Strip Mongo operator injection
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val && typeof val === 'object') {
    const cleanObj: any = {};
    for (const key of Object.keys(val)) {
      if (!key.startsWith('$')) { // Prevent mongo key injection ($where, $ne)
        cleanObj[key] = sanitizeValue(val[key]);
      }
    }
    return cleanObj;
  }
  return val;
};

export const sanitizeInputsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

// 4. JWT Authentication Middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const tokenFromCookie = req.cookies ? req.cookies['connect_access_token'] : null;

  const accessToken = tokenFromHeader || tokenFromCookie;

  if (!accessToken) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Access denied. Valid JWT authentication token required.'
    });
  }

  const payload = securityManager.verifyAccessToken(accessToken);
  if (!payload) {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired or is invalid.'
    });
  }

  // Verify session is active
  if (payload.sessionId) {
    const session = securityManager.getSession(payload.sessionId);
    if (!session) {
      return res.status(401).json({
        status: 'error',
        code: 'SESSION_REVOKED',
        message: 'Your session has been logged out or revoked.'
      });
    }
  }

  req.user = payload;
  req.sessionId = payload.sessionId;
  next();
};

// 4b. Optional JWT Authentication Middleware (populates req.user if present, never blocks with 401)
export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const tokenFromCookie = req.cookies ? req.cookies['connect_access_token'] : null;

  const accessToken = tokenFromHeader || tokenFromCookie;

  if (!accessToken) {
    return next();
  }

  try {
    const payload = securityManager.verifyAccessToken(accessToken);
    if (payload) {
      if (payload.sessionId) {
        const session = securityManager.getSession(payload.sessionId);
        if (session) {
          req.user = payload;
          req.sessionId = payload.sessionId;
        }
      } else {
        req.user = payload;
      }
    }
  } catch {
    // Non-blocking: continue without auth user
  }

  next();
};

// 5. Role-Based Access Control (RBAC) Middleware
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};
