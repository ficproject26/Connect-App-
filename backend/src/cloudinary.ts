import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'yvsm7ze0';
const API_KEY = process.env.CLOUDINARY_API_KEY || '777368858137395';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '3E133kSyEa7piWMxGrbmwuRIT_4';

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  secure_url: string;
  publicId?: string;
  error?: string;
}

/**
 * Uploads a base64 image data URI, remote URL, or binary buffer to Cloudinary.
 * Returns a permanent, durable CDN HTTPS URL (https://res.cloudinary.com/...)
 */
export async function uploadToCloudinary(
  fileInput: string,
  folder = 'products'
): Promise<CloudinaryUploadResult> {
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
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

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

    const data = (await response.json()) as any;

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
  } catch (err: any) {
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
export function isPersistentImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
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
