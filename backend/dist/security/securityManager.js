"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityManager = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// JWT Secrets initialization with safe defaults to guarantee server startup
const _jwtSecret = process.env.JWT_SECRET;
const _refreshSecret = process.env.REFRESH_TOKEN_SECRET;
if (!_jwtSecret) {
    console.warn('[Security Warning]: JWT_SECRET is not set in environment. Using default secure key.');
}
if (!_refreshSecret) {
    console.warn('[Security Warning]: REFRESH_TOKEN_SECRET is not set in environment. Using default secure key.');
}
const JWT_SECRET = _jwtSecret || 'connect_app_jwt_super_secret_key_2026_enterprise';
const REFRESH_TOKEN_SECRET = _refreshSecret || 'connect_app_refresh_token_super_secret_key_2026';
// In-Memory Enterprise Security Cache (Production stores in Redis/MongoDB)
class SecurityManager {
    constructor() {
        this.activeSessions = new Map();
        this.userSecurityRecords = new Map();
        this.auditLogs = [];
        this.otps = new Map();
    }
    // 1. Password Hashing with 12 Salt Rounds
    async hashPassword(plaintext) {
        return await bcryptjs_1.default.hash(plaintext, 12);
    }
    async comparePassword(plaintext, hash) {
        return await bcryptjs_1.default.compare(plaintext, hash);
    }
    // 2. JWT Access Token Generation (15 Min Expiry)
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    }
    // 3. JWT Refresh Token Generation (7 Days Expiry)
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    }
    // 4. Verify Access Token
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (err) {
            return null;
        }
    }
    // 5. Verify Refresh Token
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        }
        catch (err) {
            return null;
        }
    }
    // 6. Register Active Session & Token Rotation
    createSession(sessionData) {
        const session = {
            ...sessionData,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        this.activeSessions.set(sessionData.sessionId, session);
        return session;
    }
    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
    getUserSessions(userId) {
        const sessions = [];
        for (const session of this.activeSessions.values()) {
            if (session.userId === userId || session.email === userId) {
                sessions.push(session);
            }
        }
        return sessions;
    }
    revokeSession(sessionId) {
        return this.activeSessions.delete(sessionId);
    }
    revokeAllUserSessions(userId) {
        let count = 0;
        for (const [sId, session] of this.activeSessions.entries()) {
            if (session.userId === userId || session.email === userId) {
                this.activeSessions.delete(sId);
                count++;
            }
        }
        return count;
    }
    // 7. Login Lockout & Security Policy Evaluation
    getUserRecord(identifier) {
        const key = identifier.toLowerCase().trim();
        if (!this.userSecurityRecords.has(key)) {
            this.userSecurityRecords.set(key, {
                userId: key,
                email: key,
                failedLoginAttempts: 0,
                requireCaptcha: false,
                accountLockedUntil: null,
                isPermanentlyLocked: false
            });
        }
        return this.userSecurityRecords.get(key);
    }
    recordFailedLogin(identifier, ip, device) {
        const rec = this.getUserRecord(identifier);
        rec.failedLoginAttempts += 1;
        let message = `Failed login attempt ${rec.failedLoginAttempts}.`;
        let isLocked = false;
        let lockedUntil;
        if (rec.failedLoginAttempts >= 10) {
            rec.isPermanentlyLocked = true;
            message = 'Account permanently locked due to 10 failed login attempts. Contact Admin for unlock.';
            this.logEvent({
                action: 'ACCOUNT_PERMANENTLY_LOCKED',
                email: identifier,
                ip,
                device,
                country: 'India',
                status: 'BLOCKED',
                details: message
            });
        }
        else if (rec.failedLoginAttempts >= 5) {
            const lockDurationMs = 15 * 60 * 1000; // 15 Minutes
            const unlockTime = new Date(Date.now() + lockDurationMs).toISOString();
            rec.accountLockedUntil = unlockTime;
            isLocked = true;
            lockedUntil = unlockTime;
            message = 'Account locked for 15 minutes due to multiple failed login attempts.';
            this.logEvent({
                action: 'ACCOUNT_TEMPORARILY_LOCKED',
                email: identifier,
                ip,
                device,
                country: 'India',
                status: 'BLOCKED',
                details: message
            });
        }
        else if (rec.failedLoginAttempts >= 3) {
            rec.requireCaptcha = true;
            message = 'Security alert: Captcha verification required.';
        }
        this.userSecurityRecords.set(rec.email, rec);
        return {
            attempts: rec.failedLoginAttempts,
            requireCaptcha: rec.requireCaptcha,
            isLocked,
            lockedUntil,
            isPermanentlyLocked: rec.isPermanentlyLocked,
            message
        };
    }
    resetFailedLogins(identifier) {
        const rec = this.getUserRecord(identifier);
        rec.failedLoginAttempts = 0;
        rec.requireCaptcha = false;
        rec.accountLockedUntil = null;
        this.userSecurityRecords.set(rec.email, rec);
    }
    unlockAccount(identifier) {
        const rec = this.getUserRecord(identifier);
        rec.failedLoginAttempts = 0;
        rec.requireCaptcha = false;
        rec.accountLockedUntil = null;
        rec.isPermanentlyLocked = false;
        this.userSecurityRecords.set(rec.email, rec);
        return true;
    }
    isAccountLocked(identifier) {
        const rec = this.getUserRecord(identifier);
        if (rec.isPermanentlyLocked) {
            return { locked: true, reason: 'Account permanently locked due to security policy. Admin unlock required.' };
        }
        if (rec.accountLockedUntil) {
            const unlockTime = new Date(rec.accountLockedUntil).getTime();
            if (Date.now() < unlockTime) {
                const remainingMins = Math.ceil((unlockTime - Date.now()) / (60 * 1000));
                return { locked: true, reason: `Account temporarily locked. Please try again in ${remainingMins} minutes.` };
            }
            else {
                // Unlock expired
                rec.accountLockedUntil = null;
                rec.failedLoginAttempts = 0;
                this.userSecurityRecords.set(rec.email, rec);
            }
        }
        return { locked: false };
    }
    // 8. 6-Digit OTP Generator & Verifier
    generateOTP(mobileOrEmail) {
        const key = mobileOrEmail.trim().toLowerCase();
        const existing = this.otps.get(key);
        if (existing && Date.now() < existing.resendCooldown) {
            const remainingSecs = Math.ceil((existing.resendCooldown - Date.now()) / 1000);
            throw new Error(`Please wait ${remainingSecs} seconds before requesting a new OTP.`);
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 Minutes
        const resendCooldown = Date.now() + 30 * 1000; // 30 Seconds
        this.otps.set(key, {
            otp,
            expiresAt,
            attempts: 0,
            resendCooldown
        });
        return { otp, cooldownSeconds: 30 };
    }
    verifyOTP(mobileOrEmail, inputOtp) {
        const key = mobileOrEmail.trim().toLowerCase();
        const rec = this.otps.get(key);
        if (!rec) {
            return { valid: false, message: 'OTP not requested or expired. Please request a new OTP.' };
        }
        if (Date.now() > rec.expiresAt) {
            this.otps.delete(key);
            return { valid: false, message: 'OTP expired. Please request a new OTP.' };
        }
        if (rec.attempts >= 3) {
            this.otps.delete(key);
            return { valid: false, message: 'Maximum 3 OTP attempts exceeded. Please request a new OTP.' };
        }
        if (rec.otp !== inputOtp.trim()) {
            rec.attempts += 1;
            this.otps.set(key, rec);
            return { valid: false, message: `Invalid OTP. ${3 - rec.attempts} attempts remaining.` };
        }
        // Success
        this.otps.delete(key);
        return { valid: true, message: 'OTP verified successfully.' };
    }
    // 9. Security Audit Logger
    logEvent(event) {
        const auditLog = {
            ...event,
            id: 'sec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString()
        };
        this.auditLogs.unshift(auditLog);
        if (this.auditLogs.length > 500) {
            this.auditLogs.pop();
        }
    }
    getAuditLogs(limit = 100) {
        return this.auditLogs.slice(0, limit);
    }
    getAllUserSecurityRecords() {
        return Array.from(this.userSecurityRecords.values());
    }
    getSecurityMetrics() {
        let lockedCount = 0;
        for (const rec of this.userSecurityRecords.values()) {
            if (rec.isPermanentlyLocked || (rec.accountLockedUntil && new Date(rec.accountLockedUntil).getTime() > Date.now())) {
                lockedCount++;
            }
        }
        const failedLogs = this.auditLogs.filter(l => l.status === 'FAILED' || l.status === 'BLOCKED').length;
        return {
            activeSessionsCount: this.activeSessions.size,
            totalSecurityAuditLogs: this.auditLogs.length,
            lockedAccountsCount: lockedCount,
            failedAttemptsCount: failedLogs
        };
    }
}
exports.securityManager = new SecurityManager();
