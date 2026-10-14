"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOMER_ID_REGEX = exports.MONTH_ABBREVIATIONS = void 0;
exports.isValidCustomerId = isValidCustomerId;
exports.parseCustomerId = parseCustomerId;
exports.formatCustomerId = formatCustomerId;
exports.generateCustomerId = generateCustomerId;
exports.ensureCustomerIdIndexes = ensureCustomerIdIndexes;
exports.MONTH_ABBREVIATIONS = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];
exports.CUSTOMER_ID_REGEX = /^FIC-CUS-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-[0-9]{4}-[0-9]{6}$/;
/**
 * Validates whether a given string adheres to the canonical Customer ID format:
 * FIC-CUS-MMM-YYYY-NNNNNN
 */
function isValidCustomerId(id) {
    if (typeof id !== 'string')
        return false;
    return exports.CUSTOMER_ID_REGEX.test(id.trim());
}
/**
 * Parses a canonical Customer ID into its constituent components.
 */
function parseCustomerId(id) {
    if (!isValidCustomerId(id)) {
        return { valid: false };
    }
    const clean = id.trim();
    const parts = clean.split('-');
    // FIC-CUS-MMM-YYYY-NNNNNN
    // [0] FIC, [1] CUS, [2] MMM, [3] YYYY, [4] NNNNNN
    const month = parts[2];
    const year = parseInt(parts[3], 10);
    const sequence = parseInt(parts[4], 10);
    return {
        valid: true,
        prefix: `${parts[0]}-${parts[1]}`,
        month,
        year,
        sequence,
        formatted: clean
    };
}
/**
 * Formats given parts into a canonical Customer ID.
 */
function formatCustomerId(month, year, sequence) {
    const m = String(month).toUpperCase().slice(0, 3);
    const y = String(year);
    const s = String(sequence).padStart(6, '0');
    const id = `FIC-CUS-${m}-${y}-${s}`;
    if (!isValidCustomerId(id)) {
        throw new Error(`Generated invalid Customer ID: ${id}`);
    }
    return id;
}
/**
 * Atomically generates the next sequential Customer ID for a given registration date.
 * Uses MongoDB `counters` collection with atomic $inc to guarantee concurrency safety.
 * Counter resets per registration month and year (MMM-YYYY).
 */
async function generateCustomerId(mongoDb, registrationDate) {
    if (!mongoDb) {
        throw new Error('MongoDB database instance required for Customer ID generation.');
    }
    let date;
    if (!registrationDate) {
        date = new Date();
    }
    else if (registrationDate instanceof Date) {
        date = isNaN(registrationDate.getTime()) ? new Date() : registrationDate;
    }
    else {
        const parsed = new Date(registrationDate);
        date = isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    const monthIdx = date.getUTCMonth();
    const monthAbbr = exports.MONTH_ABBREVIATIONS[monthIdx];
    const year = date.getUTCFullYear();
    const counterKey = `customer_seq_${monthAbbr}_${year}`;
    const counterDoc = await mongoDb.collection('counters').findOneAndUpdate({ _id: counterKey }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
    const seq = counterDoc?.seq ?? counterDoc?.value?.seq;
    if (typeof seq !== 'number') {
        throw new Error(`Failed to obtain atomic sequence for counter ${counterKey}`);
    }
    if (seq > 999999) {
        throw new Error(`Customer ID sequence limit (999999) exceeded for period ${monthAbbr}-${year}. Cannot issue more customer IDs in this period.`);
    }
    const paddedSeq = String(seq).padStart(6, '0');
    const customerId = `FIC-CUS-${monthAbbr}-${year}-${paddedSeq}`;
    return customerId;
}
/**
 * Ensures unique database index on `customerId` for both `users` and `customers` collections.
 */
async function ensureCustomerIdIndexes(mongoDb) {
    if (!mongoDb)
        return;
    try {
        await mongoDb.collection('customers').createIndex({ customerId: 1 }, { unique: true, sparse: true, name: 'idx_unique_customer_id' }).catch(async (err) => {
            // If conflicting old index exists, log and handle
            console.warn('[DB]: Index creation note on customers:', err.message);
        });
        await mongoDb.collection('users').createIndex({ customerId: 1 }, { unique: true, sparse: true, name: 'idx_unique_user_customer_id' }).catch(async (err) => {
            console.warn('[DB]: Index creation note on users:', err.message);
        });
    }
    catch (err) {
        console.error('[DB]: Error creating Customer ID indexes:', err.message);
    }
}
