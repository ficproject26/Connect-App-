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

// 1. Helmet Security Middleware (OWASP Secure Headers)
export const helmetSecurityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.openstreetmap.org', 'https://*.cloudinary.com'],
      connectSrc: ["'self'", 'http://localhost:*', 'https://api.ficapp.in', 'wss://api.ficapp.in', 'http://13.201.132.46:*', 'wss://*'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // X-Frame-Options DENY against clickjacking
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true
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
    return val
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/(?:--|\/\*|\*\/|;|xp_)/gi, '') // Strip SQL injection tokens
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
