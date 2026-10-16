/**
 * Enterprise Validation Utility Module for Forge India Connect
 * Strict Indian Banking & UIDAI Standard Validation Rules.
 */

// 1. Name Normalization & Formatting
// Automatically capitalize the first alphabetic character of each name part
// Preserve appropriate spaces between words, strip leading spaces
export const formatCapitalizedName = (val) => {
  if (val === null || val === undefined) return '';
  const noLeading = String(val).replace(/^\s+/, '');
  // Capitalize first letter of each word (supporting English, European, and Indian regional script letters)
  return noLeading.replace(/(^|[\s.\-'])([a-zA-Z\u00C0-\u024F\u0900-\u0D7F])/g, (match, sep, char) => sep + char.toUpperCase());
};

// 1.1 Name Validation (2 to 70 characters, allows legitimate Indian and international names, regional-language characters, valid name punctuation)
export const validateName = (name, fieldLabel = 'Full Name', minLen = 2, maxLen = 70) => {
  if (!name || !String(name).trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  const cleaned = String(name).trim();
  if (cleaned.length < minLen) {
    return { isValid: false, error: `${fieldLabel} must be at least ${minLen} characters long.` };
  }
  if (cleaned.length > maxLen) {
    return { isValid: false, error: `${fieldLabel} cannot exceed ${maxLen} characters.` };
  }
  // Allow letters (including international and regional scripts), spaces, dots, hyphens, and apostrophes
  const validNameRegex = /^[\p{L}\s.'\-]+$/u;
  if (!validNameRegex.test(cleaned)) {
    return { isValid: false, error: `${fieldLabel} can contain letters, spaces, dots, hyphens, and apostrophes only.` };
  }
  return { isValid: true, error: '' };
};

// 2. Strict Indian Mobile Number Sanitizer (Typing prevention: Digits only, starts with 6,7,8,9, max 10 digits)
export const sanitizeMobileInput = (val) => {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, ''); // Digits only
  if (digits.length > 0 && !/[6-9]/.test(digits[0])) {
    return ''; // Ignore invalid first digit
  }
  return digits.slice(0, 10); // Cap at 10 digits
};

// 2.1 Strict Indian Mobile Number Validator (Regex: ^[6-9][0-9]{9}$)
export const validateMobile = (mobile, fieldLabel = 'Mobile number') => {
  if (!mobile || !String(mobile).trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  const cleaned = String(mobile).trim();
  if (cleaned.length > 0 && !/^[6-9]/.test(cleaned)) {
    return { isValid: false, error: `${fieldLabel} must start with 6, 7, 8, or 9.` };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: `${fieldLabel} must contain digits only.` };
  }
  if (cleaned.length < 10) {
    return { isValid: false, error: `Enter a valid 10-digit ${fieldLabel.toLowerCase()}.` };
  }
  if (!/^[6-9][0-9]{9}$/.test(cleaned)) {
    return { isValid: false, error: `Enter a valid 10-digit ${fieldLabel.toLowerCase()} starting with 6, 7, 8, or 9.` };
  }
  return { isValid: true, error: '' };
};

// 3. Alternate Mobile Number (Optional, if entered must match Indian mobile rules)
export const validateAltMobile = (mobile) => {
  if (!mobile || !String(mobile).trim()) {
    return { isValid: true, error: '' };
  }
  return validateMobile(mobile, 'Alternate mobile number');
};

// 4. Email Validation (Standard email structure: localpart@domain.extension, exactly one @)
export const normalizeEmail = (email) => {
  return email ? String(email).trim().toLowerCase() : '';
};

export const validateEmail = (email) => {
  if (!email || !String(email).trim()) {
    return { isValid: false, error: 'Enter a valid email address.' };
  }
  const cleaned = String(email).trim();
  if (/\s/.test(cleaned)) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }
  const atCount = (cleaned.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { isValid: false, error: 'Email address must contain exactly one "@" symbol.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid email address (e.g. name@domain.com).' };
  }
  return { isValid: true, error: '' };
};

// 5. Password Validation (Min 6 chars, >=1 uppercase, >=1 digit, >=1 special character)
// Pattern: ^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{6,}$
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{6,}$/;

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, score: 0, label: 'Weak', color: 'bg-slate-200 dark:bg-slate-800', error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, score: 1, label: 'Weak', color: 'bg-rose-500', error: 'Password must be at least 6 characters long.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);

  if (!hasUpper) {
    return { isValid: false, score: 2, label: 'Medium', color: 'bg-amber-500', error: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!hasNumber) {
    return { isValid: false, score: 2, label: 'Medium', color: 'bg-amber-500', error: 'Password must contain at least 1 numeric digit (0-9).' };
  }
  if (!hasSpecial) {
    return { isValid: false, score: 2, label: 'Medium', color: 'bg-amber-500', error: 'Password must contain at least 1 special character (e.g. @, #, $, !).' };
  }

  return { isValid: true, score: 4, label: 'Strong', color: 'bg-emerald-500', error: '' };
};

// 5.1 Confirm Password Match
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Confirm password is required.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true, error: '' };
};

// 6. Aadhaar Number Sanitizer & Validation (Exactly 12 numeric digits)
export const sanitizeAadhaarInput = (val) => {
  return String(val || '').replace(/\D/g, '').slice(0, 12);
};

export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return '';
  const clean = String(aadhaar).replace(/\D/g, '');
  if (clean.length < 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || !String(aadhaar).trim()) {
    return { isValid: false, error: 'Enter a valid 12-digit Aadhaar number.' };
  }
  const cleaned = String(aadhaar).trim().replace(/\s+/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'Aadhaar number must be exactly 12 numeric digits.' };
  }
  return { isValid: true, error: '' };
};

// 7. PAN Card Formatter & Validation (ABCDE1234F format)
export const formatPanInput = (val) => {
  return String(val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
};

export const validatePan = (pan) => {
  if (!pan || !String(pan).trim()) {
    return { isValid: false, error: 'Enter a valid PAN number.' };
  }
  const cleaned = String(pan).trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 10-character PAN number (e.g. ABCDE1234F).' };
  }
  return { isValid: true, error: '' };
};

// 8. Bank Account Number Formatter & Validation (Numeric only, 9 to 18 digits)
export const formatBankAccountInput = (val) => {
  return String(val || '').replace(/\D/g, '').slice(0, 18);
};

export const maskBankAccount = (acc) => {
  if (!acc) return '';
  const clean = String(acc).replace(/\D/g, '');
  if (clean.length < 4) return clean;
  return `••••••••${clean.slice(-4)}`;
};

export const validateBankAccount = (accountNo, confirmAccountNo = undefined) => {
  if (!accountNo || !String(accountNo).trim()) {
    return { isValid: false, error: 'Bank account number is required.' };
  }
  const cleaned = String(accountNo).trim().replace(/\s+/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Bank account number must contain numeric digits only.' };
  }
  if (cleaned.length < 9 || cleaned.length > 18) {
    return { isValid: false, error: 'Bank account number must be between 9 and 18 digits.' };
  }
  if (confirmAccountNo !== undefined && confirmAccountNo !== null && confirmAccountNo !== '') {
    const cleanConfirm = String(confirmAccountNo).trim().replace(/\s+/g, '');
    if (cleaned !== cleanConfirm) {
      return { isValid: false, error: 'Bank account numbers do not match.' };
    }
  }
  return { isValid: true, error: '' };
};

// 9. IFSC Code Formatter & Validation (11 characters: 4 uppercase letters, '0', 6 alphanumeric)
export const formatIfscInput = (val) => {
  return String(val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
};

export const validateIfsc = (ifsc) => {
  if (!ifsc || !String(ifsc).trim()) {
    return { isValid: false, error: 'IFSC code is required.' };
  }
  const cleaned = String(ifsc).trim().toUpperCase();
  if (cleaned.length !== 11) {
    return { isValid: false, error: 'IFSC code must be exactly 11 characters (e.g. SBIN0001234).' };
  }
  if (cleaned.charAt(4) !== '0') {
    return { isValid: false, error: 'The 5th character of the IFSC code must be 0 (zero).' };
  }
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 11-character IFSC code (e.g. SBIN0001234).' };
  }
  return { isValid: true, error: '' };
};

// 10. Date of Birth & Minimum Age 18 Validation
export const calculateAge = (dobString) => {
  if (!dobString) return -1;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const validateDateOfBirth = (dob, minAge = 18) => {
  if (!dob) {
    return { isValid: false, error: 'Date of birth is required.' };
  }
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Enter a valid date of birth.' };
  }
  const today = new Date();
  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future.' };
  }
  const age = calculateAge(dob);
  if (age < minAge) {
    return { isValid: false, error: `You must be at least ${minAge} years old to register.` };
  }
  return { isValid: true, error: '', age };
};

export const getMinAge18CutoffDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
};

// 11. Pincode (Strict 6-digit Indian PIN code, starts with valid Indian postal circles 1-8 / 9)
export const validatePincode = (pincode) => {
  if (!pincode || !String(pincode).trim()) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }
  const cleaned = String(pincode).trim();
  
  // Must be 6 digits and start with 1-9
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }

  // Reject all identical digits (111111, 222222, etc.)
  if (/^(\d)\1{5}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }

  // Reject dummy sequences and repeating 2-digit/3-digit dummy patterns (e.g. 282828, 121212, 123123, 123456, 654321)
  const dummyCodes = ['123456', '654321', '100000', '999999', '282828', '121212', '101010', '131313', '242424', '363636'];
  if (dummyCodes.includes(cleaned) || /^(\d{2})\1{2}$/.test(cleaned) || /^(\d{3})\1$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }

  // Valid Indian postal circle 2-digit prefixes
  const validPostalPrefixes = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // Northern (Delhi, Haryana, Punjab, HP, J&K)
    '20', '21', '22', '23', '24', '25', '26', '27', '28', // UP, Uttarakhand
    '30', '31', '32', '33', '34', '36', '37', '38', '39', // Rajasthan, Gujarat
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', // Maharashtra, MP, Chhattisgarh
    '50', '51', '52', '53', '56', '57', '58', '59', // AP, Telangana, Karnataka
    '60', '61', '62', '63', '64', '67', '68', '69', // Tamil Nadu, Kerala
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', // West Bengal, Odisha, North East
    '80', '81', '82', '83', '84', '85' // Bihar, Jharkhand
  ];

  const prefix = cleaned.substring(0, 2);
  if (!validPostalPrefixes.includes(prefix)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
  }

  return { isValid: true, error: '' };
};

// 11.1 Asynchronous PIN code validation against India Post records
export const verifyIndianPincodeAsync = async (pincode) => {
  const sync = validatePincode(pincode);
  if (!sync.isValid) return sync;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(String(pincode).trim())}`);
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
      return { isValid: true, error: '', postOffices: data[0].PostOffice };
    }
    return { isValid: false, error: 'Please enter a valid, existing 6-digit Indian PIN code.' };
  } catch (err) {
    return sync;
  }
};

// 12. Sanitizer for Text Fields (Prevent HTML tags, SQL injections, multiple spaces)
export const sanitizeInput = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/['";\-\-]/g, '') // Sanitize SQL injection chars
    .replace(/\s+/g, ' '); // Collapse multiple spaces
};

// 13. File Upload Validation (JPG, JPEG, PNG, PDF <= 5MB)
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
