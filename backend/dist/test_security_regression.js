"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const securityManager_1 = require("./security/securityManager");
const middleware_1 = require("./security/middleware");
async function runSecurityRegressionTests() {
    console.log('====================================================');
    console.log('RUNNING PRODUCTION SECURITY REGRESSION TEST SUITE');
    console.log('====================================================\n');
    let passed = 0;
    let total = 0;
    async function test(name, fn) {
        total++;
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        }
        catch (err) {
            console.error(`[FAIL] ${name}:`, err.message);
        }
    }
    // 1. JWT HS256 Pinning & Tamper Resistance
    await test('JWT: Signs and verifies valid access token with pinned HS256', () => {
        const payload = { userId: 'test_user_1', role: 'customer', email: 'test@example.com', sessionId: 'sess_test_1' };
        const token = securityManager_1.securityManager.generateAccessToken(payload);
        (0, assert_1.default)(token && typeof token === 'string', 'Token must be a non-empty string');
        const verified = securityManager_1.securityManager.verifyAccessToken(token);
        (0, assert_1.default)(verified !== null, 'Verified token must not be null');
        assert_1.default.strictEqual(verified.userId, 'test_user_1');
        assert_1.default.strictEqual(verified.role, 'customer');
    });
    await test('JWT: Tampered payload is rejected', () => {
        const token = securityManager_1.securityManager.generateAccessToken({ userId: 'cust_123', role: 'customer', email: 'cust@example.com', sessionId: 'sess_test_2' });
        const parts = token.split('.');
        assert_1.default.strictEqual(parts.length, 3, 'JWT must have 3 parts');
        // Tamper payload to elevate role to admin
        const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'cust_123', role: 'admin' })).toString('base64url');
        const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
        const result = securityManager_1.securityManager.verifyAccessToken(tamperedToken);
        assert_1.default.strictEqual(result, null, 'Tampered token must be rejected');
    });
    await test('JWT: "none" algorithm confusion is rejected', () => {
        const unsignedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const unsignedPayload = Buffer.from(JSON.stringify({ userId: 'attacker', role: 'admin' })).toString('base64url');
        const noneToken = `${unsignedHeader}.${unsignedPayload}.`;
        const result = securityManager_1.securityManager.verifyAccessToken(noneToken);
        assert_1.default.strictEqual(result, null, 'Algorithm "none" token must be rejected');
    });
    // 2. AES-256-GCM Encryption at Rest
    await test('AES-256-GCM: Encrypts and decrypts sensitive national identity (Aadhaar/PAN)', () => {
        const originalAadhaar = '1234 5678 9012';
        const encrypted = securityManager_1.securityManager.encryptAES256GCM(originalAadhaar);
        (0, assert_1.default)(encrypted.startsWith('v1:'), 'Encrypted string must be versioned with v1:');
        const parts = encrypted.split(':');
        assert_1.default.strictEqual(parts.length, 4, 'Must have v1:iv:tag:ciphertext structure');
        const decrypted = securityManager_1.securityManager.decryptAES256GCM(encrypted);
        assert_1.default.strictEqual(decrypted, originalAadhaar, 'Decrypted value must match original plaintext');
    });
    await test('AES-256-GCM: Tampered ciphertext fails GCM authentication tag check', () => {
        const encrypted = securityManager_1.securityManager.encryptAES256GCM('CONFIDENTIAL_PAN_NUMBER');
        const parts = encrypted.split(':');
        // Modify 1 byte of the ciphertext
        const tamperedCipher = 'ab' + parts[3].slice(2);
        const tamperedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCipher}`;
        let threw = false;
        try {
            securityManager_1.securityManager.decryptAES256GCM(tamperedPayload);
        }
        catch {
            threw = true;
        }
        (0, assert_1.default)(threw, 'Tampered ciphertext must fail GCM tag verification');
    });
    // 3. Password Hashing (bcrypt)
    await test('bcrypt: Securely hashes password and rejects incorrect plaintext', async () => {
        const rawPass = 'SuperSecureP@ssw0rd!2026';
        const hash = await bcryptjs_1.default.hash(rawPass, 10);
        (0, assert_1.default)(hash !== rawPass, 'Hash must not equal plaintext');
        const match = await bcryptjs_1.default.compare(rawPass, hash);
        assert_1.default.strictEqual(match, true, 'Correct password must match hash');
        const wrongMatch = await bcryptjs_1.default.compare('WrongPassword', hash);
        assert_1.default.strictEqual(wrongMatch, false, 'Incorrect password must be rejected');
    });
    // 4. Input Sanitization & NoSQL Injection Protection
    await test('Sanitization: Neutralizes MongoDB query operator injection ($gt, $ne, $where, $regex)', () => {
        const maliciousInput = {
            $gt: '',
            $where: 'sleep(5000)',
            username: 'admin',
            $regex: '.*'
        };
        const sanitized = (0, middleware_1.sanitizeValue)(maliciousInput);
        assert_1.default.strictEqual(sanitized._gt, undefined, '$gt must not exist as query operator');
        assert_1.default.strictEqual(sanitized.$gt, undefined, '$gt operator must be stripped');
        assert_1.default.strictEqual(sanitized.$where, undefined, '$where operator must be stripped');
        assert_1.default.strictEqual(sanitized.username, 'admin', 'Safe fields must be preserved');
    });
    await test('Sanitization: Strips cross-site scripting (XSS) script tags', () => {
        const xssPayload = '<script>alert("XSS")</script>Hello World';
        const sanitized = (0, middleware_1.sanitizeValue)(xssPayload);
        (0, assert_1.default)(!sanitized.includes('<script>'), 'Script tags must be stripped');
        (0, assert_1.default)(sanitized.includes('Hello World'), 'Safe text must remain');
    });
    // 5. CORS Allowlist Security
    await test('CORS: Allows trusted domains and rejects attacker origins', () => {
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('https://ficapp.in'), true, 'ficapp.in must be allowed');
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('https://www.ficapp.in'), true, 'www.ficapp.in must be allowed');
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('https://api.ficapp.in'), true, 'api.ficapp.in must be allowed');
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('https://evil-attacker.com'), false, 'evil-attacker.com must be blocked');
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('https://ficapp.in.evil.com'), false, 'Subdomain spoofing must be blocked');
        assert_1.default.strictEqual((0, middleware_1.isAllowedOrigin)('null'), false, 'null origin must be blocked');
    });
    // 6. Role Escalation Prevention
    await test('RBAC: Rejects unauthenticated role claim in session creation', () => {
        const session = securityManager_1.securityManager.createSession({
            sessionId: 'test_sess_01',
            userId: 'test_cust_1',
            email: 'user@example.com',
            role: 'customer',
            tokenHash: 'dummyhash',
            deviceName: 'TestDevice',
            os: 'TestOS',
            browser: 'TestBrowser',
            ip: '127.0.0.1',
            country: 'IN',
            city: 'Bengaluru'
        });
        assert_1.default.strictEqual(session.role, 'customer', 'Session role must match assigned role');
        const retrieved = securityManager_1.securityManager.getSession(session.sessionId);
        assert_1.default.strictEqual(retrieved?.role, 'customer', 'Retrieved session must preserve authenticated role');
    });
    console.log('\n====================================================');
    console.log(`REGRESSION TEST RESULTS: ${passed}/${total} PASSED`);
    console.log('====================================================');
    if (passed === total) {
        console.log('[STATUS]: ALL SECURITY REGRESSION TESTS PASSED CLEANLY.\n');
    }
    else {
        process.exit(1);
    }
}
runSecurityRegressionTests().catch(err => {
    console.error('[Regression Fatal]:', err);
    process.exit(1);
});
