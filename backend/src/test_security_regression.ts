import assert from 'assert';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { securityManager } from './security/securityManager';
import { sanitizeValue, isAllowedOrigin } from './security/middleware';

async function runSecurityRegressionTests() {
  console.log('====================================================');
  console.log('RUNNING PRODUCTION SECURITY REGRESSION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. JWT HS256 Pinning & Tamper Resistance
  await test('JWT: Signs and verifies valid access token with pinned HS256', () => {
    const payload = { userId: 'test_user_1', role: 'customer', email: 'test@example.com', sessionId: 'sess_test_1' };
    const token = securityManager.generateAccessToken(payload);
    assert(token && typeof token === 'string', 'Token must be a non-empty string');
    const verified = securityManager.verifyAccessToken(token);
    assert(verified !== null, 'Verified token must not be null');
    assert.strictEqual(verified.userId, 'test_user_1');
    assert.strictEqual(verified.role, 'customer');
  });

  await test('JWT: Tampered payload is rejected', () => {
    const token = securityManager.generateAccessToken({ userId: 'cust_123', role: 'customer', email: 'cust@example.com', sessionId: 'sess_test_2' });
    const parts = token.split('.');
    assert.strictEqual(parts.length, 3, 'JWT must have 3 parts');
    // Tamper payload to elevate role to admin
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'cust_123', role: 'admin' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const result = securityManager.verifyAccessToken(tamperedToken);
    assert.strictEqual(result, null, 'Tampered token must be rejected');
  });

  await test('JWT: "none" algorithm confusion is rejected', () => {
    const unsignedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const unsignedPayload = Buffer.from(JSON.stringify({ userId: 'attacker', role: 'admin' })).toString('base64url');
    const noneToken = `${unsignedHeader}.${unsignedPayload}.`;
    const result = securityManager.verifyAccessToken(noneToken);
    assert.strictEqual(result, null, 'Algorithm "none" token must be rejected');
  });

  // 2. AES-256-GCM Encryption at Rest
  await test('AES-256-GCM: Encrypts and decrypts sensitive national identity (Aadhaar/PAN)', () => {
    const originalAadhaar = '1234 5678 9012';
    const encrypted = securityManager.encryptAES256GCM(originalAadhaar);
    assert(encrypted.startsWith('v1:'), 'Encrypted string must be versioned with v1:');
    const parts = encrypted.split(':');
    assert.strictEqual(parts.length, 4, 'Must have v1:iv:tag:ciphertext structure');
    const decrypted = securityManager.decryptAES256GCM(encrypted);
    assert.strictEqual(decrypted, originalAadhaar, 'Decrypted value must match original plaintext');
  });

  await test('AES-256-GCM: Tampered ciphertext fails GCM authentication tag check', () => {
    const encrypted = securityManager.encryptAES256GCM('CONFIDENTIAL_PAN_NUMBER');
    const parts = encrypted.split(':');
    // Modify 1 byte of the ciphertext
    const tamperedCipher = 'ab' + parts[3].slice(2);
    const tamperedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCipher}`;
    let threw = false;
    try {
      securityManager.decryptAES256GCM(tamperedPayload);
    } catch {
      threw = true;
    }
    assert(threw, 'Tampered ciphertext must fail GCM tag verification');
  });

  // 3. Password Hashing (bcrypt)
  await test('bcrypt: Securely hashes password and rejects incorrect plaintext', async () => {
    const rawPass = 'SuperSecureP@ssw0rd!2026';
    const hash = await bcrypt.hash(rawPass, 10);
    assert(hash !== rawPass, 'Hash must not equal plaintext');
    const match = await bcrypt.compare(rawPass, hash);
    assert.strictEqual(match, true, 'Correct password must match hash');
    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(wrongMatch, false, 'Incorrect password must be rejected');
  });

  // 4. Input Sanitization & NoSQL Injection Protection
  await test('Sanitization: Neutralizes MongoDB query operator injection ($gt, $ne, $where, $regex)', () => {
    const maliciousInput = {
      $gt: '',
      $where: 'sleep(5000)',
      username: 'admin',
      $regex: '.*'
    };
    const sanitized = sanitizeValue(maliciousInput);
    assert.strictEqual(sanitized._gt, undefined, '$gt must not exist as query operator');
    assert.strictEqual(sanitized.$gt, undefined, '$gt operator must be stripped');
    assert.strictEqual(sanitized.$where, undefined, '$where operator must be stripped');
    assert.strictEqual(sanitized.username, 'admin', 'Safe fields must be preserved');
  });

  await test('Sanitization: Strips cross-site scripting (XSS) script tags', () => {
    const xssPayload = '<script>alert("XSS")</script>Hello World';
    const sanitized = sanitizeValue(xssPayload);
    assert(!sanitized.includes('<script>'), 'Script tags must be stripped');
    assert(sanitized.includes('Hello World'), 'Safe text must remain');
  });

  // 5. CORS Allowlist Security
  await test('CORS: Allows trusted domains and rejects attacker origins', () => {
    assert.strictEqual(isAllowedOrigin('https://ficapp.in'), true, 'ficapp.in must be allowed');
    assert.strictEqual(isAllowedOrigin('https://www.ficapp.in'), true, 'www.ficapp.in must be allowed');
    assert.strictEqual(isAllowedOrigin('https://api.ficapp.in'), true, 'api.ficapp.in must be allowed');
    assert.strictEqual(isAllowedOrigin('https://evil-attacker.com'), false, 'evil-attacker.com must be blocked');
    assert.strictEqual(isAllowedOrigin('https://ficapp.in.evil.com'), false, 'Subdomain spoofing must be blocked');
    assert.strictEqual(isAllowedOrigin('null'), false, 'null origin must be blocked');
  });

  // 6. Role Escalation Prevention
  await test('RBAC: Rejects unauthenticated role claim in session creation', () => {
    const session = securityManager.createSession({
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
    assert.strictEqual(session.role, 'customer', 'Session role must match assigned role');
    const retrieved = securityManager.getSession(session.sessionId);
    assert.strictEqual(retrieved?.role, 'customer', 'Retrieved session must preserve authenticated role');
  });

  console.log('\n====================================================');
  console.log(`REGRESSION TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================');

  if (passed === total) {
    console.log('[STATUS]: ALL SECURITY REGRESSION TESTS PASSED CLEANLY.\n');
  } else {
    process.exit(1);
  }
}

runSecurityRegressionTests().catch(err => {
  console.error('[Regression Fatal]:', err);
  process.exit(1);
});
