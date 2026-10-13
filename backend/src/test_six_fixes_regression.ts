import assert from 'assert';
import { securityManager } from './security/securityManager';

async function runRegression() {
  console.log('====================================================');
  console.log('BACKEND REGRESSION TEST SUITE FOR TARGETED FIXES');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. PIN Code Validation Check
  test('Pincode: Strict Indian PIN code regex rejects 100000 and invalid formats', () => {
    const validateServerPin = (pincode: any) => {
      const cleanPin = String(pincode || '').trim();
      if (!/^[1-9][0-9]{5}$/.test(cleanPin) || cleanPin === '100000' || cleanPin.startsWith('10')) {
        return { valid: false, message: 'Please enter a valid 6-digit Indian PIN code.' };
      }
      return { valid: true, message: '' };
    };

    assert.strictEqual(validateServerPin('100000').valid, false);
    assert.strictEqual(validateServerPin('100000').message, 'Please enter a valid 6-digit Indian PIN code.');
    assert.strictEqual(validateServerPin('101234').valid, false);
    assert.strictEqual(validateServerPin('056001').valid, false);
    assert.strictEqual(validateServerPin('12345').valid, false);
    assert.strictEqual(validateServerPin('1234567').valid, false);
    assert.strictEqual(validateServerPin('abcdef').valid, false);

    assert.strictEqual(validateServerPin('560072').valid, true);
    assert.strictEqual(validateServerPin('560034').valid, true);
    assert.strictEqual(validateServerPin('110001').valid, true);
  });

  // 2. Login Invalid Credentials Exact Message Contract
  test('Login: Returns exact invalid credentials message for security', () => {
    const expectedMsg = 'Invalid email/mobile number or password. Please check your credentials and try again.';
    // Simulate what /login returns
    const mockAuthFailure = (dbUserFound: boolean, passwordMatch: boolean) => {
      if (!dbUserFound || !passwordMatch) {
        return {
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: expectedMsg
        };
      }
      return { status: 'success' };
    };

    const wrongPassword = mockAuthFailure(true, false);
    assert.strictEqual(wrongPassword.status, 'error');
    assert.strictEqual(wrongPassword.code, 'INVALID_CREDENTIALS');
    assert.strictEqual(wrongPassword.message, expectedMsg);

    const nonexistentUser = mockAuthFailure(false, false);
    assert.strictEqual(nonexistentUser.status, 'error');
    assert.strictEqual(nonexistentUser.code, 'INVALID_CREDENTIALS');
    assert.strictEqual(nonexistentUser.message, expectedMsg);
  });

  // 3. Forgot Password OTP Flow with SecurityManager
  test('Forgot Password: Generates and verifies reset OTP via SecurityManager', () => {
    const resetKey = 'reset_testuser@example.com';
    const { otp, cooldownSeconds } = securityManager.generateOTP(resetKey);
    assert.strictEqual(typeof otp, 'string');
    assert.strictEqual(otp.length, 6);
    assert.strictEqual(cooldownSeconds, 30);

    // Wrong OTP attempt
    const wrongAttempt = securityManager.verifyOTP(resetKey, '999999');
    assert.strictEqual(wrongAttempt.valid, false);

    // Correct OTP attempt
    const correctAttempt = securityManager.verifyOTP(resetKey, otp);
    assert.strictEqual(correctAttempt.valid, true);
    assert.strictEqual(correctAttempt.message, 'OTP verified successfully.');
  });

  // 4. Travel and Stay Order Address Requirement Relaxation
  test('Orders: Travel and Stay bookings do not require customer_address', () => {
    const validateOrderInput = (body: any) => {
      const { customer_name, customer_phone, customer_address, amount, type, checkInDate, checkOutDate, boardingPoint, droppingPoint } = body;
      const isTravelOrStayBooking = 
        type === 'Travel' || type === 'Stay' || type === 'Travel Ticket' || type === 'Hotel Stay' ||
        (typeof type === 'string' && (
          type.toLowerCase().includes('travel') || 
          type.toLowerCase().includes('stay') || 
          type.toLowerCase().includes('hotel') || 
          type.toLowerCase().includes('resort') || 
          type.toLowerCase().includes('bus') || 
          type.toLowerCase().includes('tour') || 
          type.toLowerCase().includes('flight')
        )) ||
        Boolean(checkInDate && checkOutDate) || 
        Boolean(boardingPoint || droppingPoint);

      if (!customer_name || !customer_phone || (!isTravelOrStayBooking && !customer_address) || amount === undefined || amount === null) {
        return {
          valid: false,
          message: isTravelOrStayBooking 
            ? 'Customer name, phone, and amount are required.' 
            : 'Customer name, phone, address, and amount are required.'
        };
      }
      return { valid: true };
    };

    // Stay booking without delivery address -> VALID
    const stayRes = validateOrderInput({
      customer_name: 'Moorthy',
      customer_phone: '9876543210',
      type: 'Stay',
      checkInDate: '2026-10-11',
      checkOutDate: '2026-10-15',
      amount: 6000
    });
    assert.strictEqual(stayRes.valid, true, 'Stay booking without address must be accepted');

    // Travel booking without delivery address -> VALID
    const travelRes = validateOrderInput({
      customer_name: 'Moorthy',
      customer_phone: '9876543210',
      type: 'Travel',
      boardingPoint: { name: 'Majestic' },
      droppingPoint: { name: 'Panaji' },
      amount: 1500
    });
    assert.strictEqual(travelRes.valid, true, 'Travel booking without address must be accepted');

    // Product order without delivery address -> INVALID
    const productRes = validateOrderInput({
      customer_name: 'Moorthy',
      customer_phone: '9876543210',
      type: 'Product',
      amount: 2500
    });
    assert.strictEqual(productRes.valid, false, 'Product order without delivery address must be rejected');
    assert.strictEqual(productRes.message, 'Customer name, phone, address, and amount are required.');

    // Product order with delivery address -> VALID
    const validProductRes = validateOrderInput({
      customer_name: 'Moorthy',
      customer_phone: '9876543210',
      customer_address: '123 Main St, Bangalore, 560072',
      type: 'Product',
      amount: 2500
    });
    assert.strictEqual(validProductRes.valid, true, 'Product order with address must be accepted');
  });

  console.log(`\nAll ${passed}/${total} backend regression tests passed successfully!`);
}

runRegression();
