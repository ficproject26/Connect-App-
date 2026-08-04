/**
 * Enterprise Validation Utility Module for Forge India Connect
 * Strict banking/government portal level validation rules.
 */

// 1. Mobile Number (Required, 10 digits, cannot start with 0)
export const validateMobile = (mobile) => {
  if (!mobile || !mobile.trim()) {
    return { isValid: false, error: 'Mobile number is required.' };
  }
  const cleaned = mobile.trim();
  if (cleaned.startsWith('0')) {
    return { isValid: false, error: 'Enter a valid 10-digit mobile number (cannot start with 0).' };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must contain digits only.' };
  }
  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (!/^[1-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 10-digit mobile number.' };
  }
  return { isValid: true, error: '' };
};

// 2. Alternate Mobile Number (Optional, if entered must be 10 digits)
export const validateAltMobile = (mobile) => {
  if (!mobile || !mobile.trim()) {
    return { isValid: true, error: '' };
  }
  return validateMobile(mobile);
};

// 3. Aadhaar Number (Required, 12 digits)
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || !aadhaar.trim()) {
    return { isValid: false, error: 'Enter a valid 12-digit Aadhaar number.' };
  }
  const cleaned = aadhaar.trim().replace(/\s+/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 12-digit Aadhaar number.' };
  }
  return { isValid: true, error: '' };
};

// 4. PAN Number (Required, ABCDE1234F format)
export const validatePan = (pan) => {
  if (!pan || !pan.trim()) {
    return { isValid: false, error: 'Enter a valid PAN number.' };
  }
  const cleaned = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid PAN number.' };
  }
  return { isValid: true, error: '' };
};

// 5. Email (Required, RFC standard format)
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Enter a valid email address.' };
  }
  const cleaned = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid email address.' };
  }
  return { isValid: true, error: '' };
};

// 6. Password Strength & Requirement (Min 8 chars, Uppercase, Lowercase, Number, Special char)
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, score: 0, label: 'Weak', color: 'bg-slate-200 dark:bg-slate-800', error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, score: 1, label: 'Weak', color: 'bg-rose-500', error: 'Password must be at least 8 characters long.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      score: 2, 
      label: 'Medium', 
      color: 'bg-amber-500', 
      error: 'Password must contain uppercase, lowercase, number & special character.' 
    };
  }

  return { isValid: true, score: 4, label: 'Strong', color: 'bg-emerald-500', error: '' };
};

// 7. Confirm Password Match
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Confirm password is required.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true, error: '' };
};

// 8. Pincode (Exactly 6 digits)
export const validatePincode = (pincode) => {
  if (!pincode || !pincode.trim()) {
    return { isValid: false, error: 'Pincode is required.' };
  }
  const cleaned = pincode.trim();
  if (!/^\d{6}$/.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 6-digit Pincode.' };
  }
  return { isValid: true, error: '' };
};

// 9. Name (Letters and spaces only, 3-50 chars)
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full Name is required.' };
  }
  const cleaned = name.trim();
  if (cleaned.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters long.' };
  }
  if (cleaned.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters.' };
  }
  if (!/^[a-zA-Z\s]+$/.test(cleaned)) {
    return { isValid: false, error: 'Name can contain letters and spaces only.' };
  }
  return { isValid: true, error: '' };
};

// 10. Sanitizer for Text Fields (Prevent HTML tags, SQL injections, multiple spaces)
export const sanitizeInput = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/['";\-\-]/g, '') // Sanitize SQL injection chars
    .replace(/\s+/g, ' '); // Collapse multiple spaces
};

// 11. File Upload Validation (JPG, JPEG, PNG, PDF <= 5MB)
export const validateFileUpload = (file, allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'], maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'Please select a file to upload.' };
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return { isValid: false, error: `File type not supported. Allowed formats: ${allowedTypes.join(', ').toUpperCase()}` };
  }
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxSizeMB) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }
  return { isValid: true, error: '' };
};
