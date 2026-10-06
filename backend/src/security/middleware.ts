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
//   - ficapp.in / onrender.com — Connect App frontend/API origins
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
    // Render.com hosted services
    'https://connect-app-7s6g.onrender.com',
    'wss://connect-app-7s6g.onrender.com',
    'https://connect-admin-96pc.onrender.com',
    'wss://connect-admin-96pc.onrender.com',
    // EC2 / alternate host
    'http://13.201.132.46:*',
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
  // includeSubDomains: protects all subdomains of ficapp.in / onrender.com
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

// 2. Auth & OTP Rate Limiter (5 requests / min -> HTTP 429)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 5, // 5 requests max
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait 1 minute before trying again.'
  }
});

// 3. Input Sanitizer Middleware (XSS, SQL Injection & Mongo Injection protection)
const sanitizeValue = (val: any): any => {
  if (typeof val === 'string') {
    if (val.startsWith('data:') && val.includes(';base64,')) {
      return val;
    }
    return val
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/(?:--|\/\*|\*\/|xp_)/gi, '') // Strip SQL injection tokens
      .replace(/\$(?:gt|gte|lt|lte|ne|eq|where|regex)/gi, ''); // Strip Mongo operator injection
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
