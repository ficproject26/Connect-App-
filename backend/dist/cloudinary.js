"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
exports.isPersistentImageUrl = isPersistentImageUrl;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// SECURITY: Cloudinary credentials must ONLY come from environment variables.
// Never hardcode API keys or secrets in source code.
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.warn('[Cloudinary] WARNING: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET environment variable is not set. Image uploads will fail.');
}
/**
 * Uploads a base64 image data URI, remote URL, or binary buffer to Cloudinary.
 * Returns a permanent, durable CDN HTTPS URL (https://res.cloudinary.com/...)
 */
async function uploadToCloudinary(fileInput, folder = 'products') {
    if (!fileInput || typeof fileInput !== 'string') {
        return { success: false, url: '', secure_url: '', error: 'Empty or invalid file input' };
    }
    const trimmed = fileInput.trim();
    // If already a permanent Cloudinary URL, return as is
    if (trimmed.startsWith('https://res.cloudinary.com/')) {
        return { success: true, url: trimmed, secure_url: trimmed };
    }
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        // Cloudinary signature parameters must be sorted alphabetically
        const strToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
        const signature = crypto_1.default.createHash('sha1').update(strToSign).digest('hex');
        const formData = new URLSearchParams();
        formData.append('file', trimmed);
        formData.append('api_key', API_KEY);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        const data = (await response.json());
        if (data && (data.secure_url || data.url)) {
            const permanentUrl = data.secure_url || data.url;
            return {
                success: true,
                url: permanentUrl,
                secure_url: permanentUrl,
                publicId: data.public_id
            };
        }
        console.error('[Cloudinary Upload Error]:', data?.error?.message || data);
        return {
            success: false,
            url: '',
            secure_url: '',
            error: data?.error?.message || 'Failed to upload image to Cloudinary'
        };
    }
    catch (err) {
        console.error('[Cloudinary Exception]:', err.message);
        return {
            success: false,
            url: '',
            secure_url: '',
            error: err.message || 'Network error while uploading to Cloudinary'
        };
    }
}
/**
 * Checks whether an image URL is a persistent CDN reference.
 */
function isPersistentImageUrl(url) {
    if (!url || typeof url !== 'string')
        return false;
    const lower = url.trim().toLowerCase();
    if (lower.startsWith('blob:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.includes('/tmp/')) {
        return false;
    }
    if (lower.includes('localhost') || lower.includes('127.0.0.1')) {
        return false;
    }
    // Exclude ephemeral Render upload paths
    if (lower.includes('connect-vendor.onrender.com/uploads/')) {
        return false;
    }
    return lower.startsWith('http://') || lower.startsWith('https://');
}
