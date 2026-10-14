const fs = require('fs');
const path = require('path');

console.log('--- Starting Cross-Repo Customer ID Synchronization ---');

// 1. D:\admin ConnectApp\backend\routes\admin.js
const adminJsPath = 'D:/admin ConnectApp/backend/routes/admin.js';
if (fs.existsSync(adminJsPath)) {
  let content = fs.readFileSync(adminJsPath, 'utf8');

  // Replace getCanonicalCustomerId
  const oldHelperRegex = /\/\/ HELPER: Deterministic Canonical Customer ID Generator[\s\S]*?function getCanonicalCustomerId\(userOrId\)[\s\S]*?\n\}/;
  const newHelper = `// HELPER: Deterministic Canonical Customer ID Generator (Canonical FIC-CUS-MMM-YYYY-NNNNNN)
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function isValidCustomerId(id) {
    if (!id || typeof id !== 'string') return false;
    return /^FIC-CUS-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-[0-9]{4}-[0-9]{6}$/.test(id.trim());
}

function getCanonicalCustomerId(userOrId, date = new Date()) {
    if (!userOrId) return 'FIC-CUS-OCT-2026-000001';
    if (typeof userOrId === 'object' && userOrId !== null) {
        if (userOrId._bsontype === 'ObjectID' || (mongoose.Types && mongoose.Types.ObjectId && userOrId instanceof mongoose.Types.ObjectId) || typeof userOrId.toHexString === 'function') {
            return getCanonicalCustomerId(userOrId.toString());
        }
        if (userOrId.customerId && isValidCustomerId(userOrId.customerId)) {
            return String(userOrId.customerId);
        }
        if (userOrId.registrationId && isValidCustomerId(userOrId.registrationId)) {
            return String(userOrId.registrationId);
        }
        if (userOrId.customerId && !String(userOrId.customerId).startsWith('FIC-CUST-')) {
            return String(userOrId.customerId);
        }
        if (userOrId.registrationId && !String(userOrId.registrationId).startsWith('FIC-CUST-')) {
            return String(userOrId.registrationId);
        }
        const target = userOrId.email || userOrId.phone || userOrId.mobileNumber || userOrId.mobile || userOrId.name || userOrId.username || (userOrId._id ? String(userOrId._id) : (userOrId.id ? String(userOrId.id) : ''));
        const regDate = userOrId.createdAt || userOrId.created_at ? new Date(userOrId.createdAt || userOrId.created_at) : date;
        return getCanonicalCustomerId(String(target || ''), regDate);
    }
    const clean = String(userOrId).trim();
    if (isValidCustomerId(clean)) {
        return clean;
    }
    const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    const mmm = MONTH_NAMES[d.getMonth()];
    const yyyy = d.getFullYear();
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
        hash = ((hash << 5) - hash) + clean.charCodeAt(i);
        hash |= 0;
    }
    const seq = String((Math.abs(hash) % 900000) + 1).padStart(6, '0');
    return \`FIC-CUS-\${mmm}-\${yyyy}-\${seq}\`;
}`;

  if (oldHelperRegex.test(content)) {
    content = content.replace(oldHelperRegex, newHelper);
    console.log('[admin.js]: Replaced getCanonicalCustomerId with canonical version');
  } else {
    console.log('[admin.js]: Warning - oldHelperRegex did not match exactly, checking if already updated');
  }

  // Update custCanonicalId in admin.js
  content = content.replace(
    /cKey && cKey\.startsWith\('FIC-CUST-'\)/g,
    "cKey && (cKey.startsWith('FIC-CUS-') || cKey.startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(obj\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(obj.customerId).startsWith('FIC-CUS-') || String(obj.customerId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.customerId).startsWith('FIC-CUS-') || String(order.customerId).startsWith('FIC-CUST-'))"
  );

  fs.writeFileSync(adminJsPath, content, 'utf8');
  console.log('[admin.js]: Successfully saved updates');
} else {
  console.warn('[admin.js]: Path does not exist:', adminJsPath);
}

// 2. D:\vendor\frontend\src\pages\VendorDashboard.jsx
const vendorDashPath = 'D:/vendor/frontend/src/pages/VendorDashboard.jsx';
if (fs.existsSync(vendorDashPath)) {
  let content = fs.readFileSync(vendorDashPath, 'utf8');
  
  // Update startsWith('FIC-CUST-') to also support startsWith('FIC-CUS-')
  content = content.replace(
    /String\(c\.customerDisplayId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.customerDisplayId).startsWith('FIC-CUS-') || String(c.customerDisplayId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.customerId).startsWith('FIC-CUS-') || String(c.customerId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.registrationId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.registrationId).startsWith('FIC-CUS-') || String(c.registrationId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.memberId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.memberId).startsWith('FIC-CUS-') || String(c.memberId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /rawId\.startsWith\('FIC-CUST-'\)/g,
    "(rawId.startsWith('FIC-CUS-') || rawId.startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.customerDisplayId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.customerDisplayId).startsWith('FIC-CUS-') || String(order.customerDisplayId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.customerId).startsWith('FIC-CUS-') || String(order.customerId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.memberId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.memberId).startsWith('FIC-CUS-') || String(order.memberId).startsWith('FIC-CUST-'))"
  );

  fs.writeFileSync(vendorDashPath, content, 'utf8');
  console.log('[VendorDashboard.jsx]: Successfully updated customer ID detection');
}

// 3. D:\vendor\frontend\src\pages\orders\Orders.jsx
const vendorOrdersPath = 'D:/vendor/frontend/src/pages/orders/Orders.jsx';
if (fs.existsSync(vendorOrdersPath)) {
  let content = fs.readFileSync(vendorOrdersPath, 'utf8');

  content = content.replace(
    /String\(c\.customerDisplayId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.customerDisplayId).startsWith('FIC-CUS-') || String(c.customerDisplayId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.customerId).startsWith('FIC-CUS-') || String(c.customerId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.registrationId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.registrationId).startsWith('FIC-CUS-') || String(c.registrationId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(c\.memberId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(c.memberId).startsWith('FIC-CUS-') || String(c.memberId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /rawId\.startsWith\('FIC-CUST-'\)/g,
    "(rawId.startsWith('FIC-CUS-') || rawId.startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.customerDisplayId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.customerDisplayId).startsWith('FIC-CUS-') || String(order.customerDisplayId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.customerId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.customerId).startsWith('FIC-CUS-') || String(order.customerId).startsWith('FIC-CUST-'))"
  );
  content = content.replace(
    /String\(order\.memberId\)\.startsWith\('FIC-CUST-'\)/g,
    "(String(order.memberId).startsWith('FIC-CUS-') || String(order.memberId).startsWith('FIC-CUST-'))"
  );

  fs.writeFileSync(vendorOrdersPath, content, 'utf8');
  console.log('[Orders.jsx]: Successfully updated customer ID detection');
}

// 4. D:\vendor\backend\routes\publicRoutes.js
const vendorPublicRoutesPath = 'D:/vendor/backend/routes/publicRoutes.js';
if (fs.existsSync(vendorPublicRoutesPath)) {
  let content = fs.readFileSync(vendorPublicRoutesPath, 'utf8');

  content = content.replace(
    /!String\(resolvedCustId\)\.startsWith\('FIC-CUST-'\)/g,
    "(!String(resolvedCustId).startsWith('FIC-CUS-') && !String(resolvedCustId).startsWith('FIC-CUST-'))"
  );

  fs.writeFileSync(vendorPublicRoutesPath, content, 'utf8');
  console.log('[publicRoutes.js]: Successfully updated resolvedCustId validation');
}

console.log('--- Cross-Repo Synchronization Complete ---');
