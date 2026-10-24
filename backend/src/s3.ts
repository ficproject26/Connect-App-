import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Ensure backend .env is loaded regardless of current working directory
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const AWS_REGION = process.env.AWS_REGION || '';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || '';

if (!AWS_REGION || !AWS_S3_BUCKET) {
  console.warn('[AWS S3] WARNING: AWS_REGION or AWS_S3_BUCKET environment variable is not set. S3 uploads will fail until configured.');
}

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!region || !bucket) {
    throw new Error('[AWS S3] AWS_REGION and AWS_S3_BUCKET must be configured in environment variables.');
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({ region });
  }
  return s3ClientInstance;
}

export interface S3UploadResult {
  success: boolean;
  url: string;
  secure_url: string;
  key?: string;
  publicId?: string;
  directSignedUrl?: string;
  error?: string;
}

// In-memory cache for presigned viewing URLs to eliminate redundant AWS signing requests (TTL: 1 hour)
interface PresignedUrlCacheEntry {
  url: string;
  expiresAt: number;
}
const presignedUrlCache = new Map<string, PresignedUrlCacheEntry>();

// Clean expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, entry] of presignedUrlCache.entries()) {
    if (entry.expiresAt <= now) {
      presignedUrlCache.delete(k);
    }
  }
}, 10 * 60 * 1000).unref?.();

/**
 * Extracts a clean S3 object key (e.g. "products/1729...jpg") from a key or URL.
 */
export function extractS3Key(urlOrKey: string): string | null {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const trimmed = urlOrKey.trim();

  // Exclude non-S3 sources
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('https://res.cloudinary.com/')) {
    return null;
  }

  // 1. Matches canonical backend media endpoint: /api/media/s3/{key}
  const mediaMatch = trimmed.match(/\/api\/(?:media|uploads)\/s3\/([^?#]+)/i);
  if (mediaMatch && mediaMatch[1]) {
    return decodeURIComponent(mediaMatch[1]).replace(/^\/+/, '');
  }

  // 2. Matches CloudFront domain if configured
  const cfDomain = (process.env.AWS_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL || '').replace(/https?:\/\//i, '').replace(/\/+$/, '');
  if (cfDomain && trimmed.includes(cfDomain)) {
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    } catch {
      // Fallback
    }
  }

  // 3. Matches standard AWS S3 URLs (path-style or virtual-hosted-style, signed or unsigned)
  if (trimmed.includes('amazonaws.com')) {
    try {
      const parsed = new URL(trimmed);
      let p = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
      const parts = p.split('/');
      // If path-style URL includes bucket name in first path segment, strip it
      if (parts.length > 1 && ['products', 'vendor_uploads', 'admin_uploads', 'connect_uploads', 'kyc', 'documents', 'banners', 'categories', 'general', 'profiles', 'thumbnails'].includes(parts[1])) {
        p = parts.slice(1).join('/');
      }
      return p;
    } catch {
      const match = trimmed.match(/amazonaws\.com\/([^?#]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).replace(/^\/+/, '');
      }
    }
  }

  // 4. Raw key format: folder/filename.ext
  if (/^[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp|gif|avif|pdf|svg)$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns the permanent, durable viewing URL for an S3 object key.
 * Prefers CloudFront CDN URL if configured, otherwise returns canonical backend media endpoint.
 */
export function getDurableImageUrl(objectKey: string): string {
  if (!objectKey) return '';
  const cleanKey = objectKey.replace(/^\/+/, '');
  const cloudfrontDomain = process.env.AWS_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL;
  if (cloudfrontDomain) {
    const cfBase = cloudfrontDomain.startsWith('http') ? cloudfrontDomain : `https://${cloudfrontDomain}`;
    return `${cfBase.replace(/\/+$/, '')}/${cleanKey}`;
  }
  const backendBase = process.env.BACKEND_URL || 'https://api.ficapp.in';
  return `${backendBase.replace(/\/+$/, '')}/api/media/s3/${cleanKey}`;
}

/**
 * Resolves any stored image reference (Cloudinary, S3 pre-signed, S3 key, local, Unsplash)
 * into a durable, permanent URL.
 * - Cloudinary URLs are 100% preserved and never modified.
 * - Expired or expiring S3 pre-signed URLs are converted into durable canonical media URLs.
 * - Local uploads and external CDNs are preserved untouched.
 */
export function resolveDurableImageUrl(input: string | any): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';

  // 1. Cloudinary URLs are permanent CDN links - NEVER touch or break them!
  if (trimmed.startsWith('https://res.cloudinary.com/')) {
    return trimmed;
  }

  // 2. Data or Blob URIs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 3. Local upload references
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return trimmed;
  }

  // 4. Already durable canonical backend media URL
  if (trimmed.includes('/api/media/s3/')) {
    return trimmed;
  }

  // 5. CloudFront URL
  const cfDomain = (process.env.AWS_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL || '').replace(/https?:\/\//i, '').replace(/\/+$/, '');
  if (cfDomain && trimmed.includes(cfDomain)) {
    return trimmed;
  }

  // 6. S3 Pre-signed URL or S3 URL (expired or fresh) or Raw S3 Key
  const key = extractS3Key(trimmed);
  if (key) {
    return getDurableImageUrl(key);
  }

  // 7. Other valid HTTP/HTTPS URLs (Unsplash placeholders, external CDNs)
  return trimmed;
}

/**
 * Generates an authenticated pre-signed URL with caching to eliminate redundant AWS requests.
 */
export async function getPresignedViewUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!key || typeof key !== 'string') return '';
  const cleanKey = extractS3Key(key) || key.replace(/^\/+/, '');
  const cacheKey = `${cleanKey}:${expiresIn}`;

  const cached = presignedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.url;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: cleanKey
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn });
  presignedUrlCache.set(cacheKey, {
    url: signedUrl,
    expiresAt: Date.now() + (expiresIn - 60) * 1000
  });

  return signedUrl;
}

/**
 * Streams an S3 object directly for the backend media endpoint.
 */
export async function getObjectStream(key: string): Promise<{
  success: boolean;
  body?: any;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  error?: string;
}> {
  try {
    const bucket = process.env.AWS_S3_BUCKET;
    const client = getS3Client();
    const cleanKey = key.replace(/^\/+/, '');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: cleanKey
    });

    const response = await client.send(command);
    return {
      success: true,
      body: response.Body,
      contentType: response.ContentType || 'image/jpeg',
      contentLength: response.ContentLength,
      etag: response.ETag
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'NoSuchKey' ? 'Object not found in S3 bucket' : (err.message || 'Failed to fetch object from S3')
    };
  }
}

/**
 * Uploads a base64 image data URI, remote URL, or binary buffer to AWS S3.
 * Returns a permanent, durable viewing URL and the clean S3 object key.
 */
export async function uploadToS3(
  fileInput: string | Buffer,
  folder = 'products'
): Promise<S3UploadResult> {
  try {
    let fileBuffer: Buffer;
    let mimeType = 'image/jpeg';
    let extension = 'jpg';

    if (Buffer.isBuffer(fileInput)) {
      fileBuffer = fileInput;
    } else if (typeof fileInput === 'string') {
      const trimmed = fileInput.trim();

      // If already a permanent Cloudinary URL, preserve it untouched!
      if (trimmed.startsWith('https://res.cloudinary.com/')) {
        return { success: true, url: trimmed, secure_url: trimmed, key: trimmed, publicId: trimmed };
      }

      // If already a durable backend media URL, preserve it!
      if (trimmed.includes('/api/media/s3/')) {
        const key = extractS3Key(trimmed) || trimmed;
        return { success: true, url: trimmed, secure_url: trimmed, key, publicId: key };
      }

      // If already an S3 URL or signed URL, extract key and return durable URL
      if (trimmed.includes('amazonaws.com')) {
        const existingKey = extractS3Key(trimmed);
        if (existingKey) {
          const durableUrl = getDurableImageUrl(existingKey);
          return { success: true, url: durableUrl, secure_url: durableUrl, key: existingKey, publicId: existingKey };
        }
      }

      // Payload size check (15MB maximum)
      if (trimmed.length > 15 * 1024 * 1024) {
        return { success: false, url: '', secure_url: '', error: 'Payload exceeds maximum permissible upload size limit (15MB).' };
      }

      if (trimmed.startsWith('data:')) {
        const match = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
        if (!match) {
          return { success: false, url: '', secure_url: '', error: 'Malformed base64 data URI.' };
        }
        mimeType = match[1].toLowerCase();
        const ALLOWED_MIMES: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'image/avif': 'avif',
          'application/pdf': 'pdf'
        };
        if (!ALLOWED_MIMES[mimeType]) {
          return { success: false, url: '', secure_url: '', error: `MIME type '${mimeType}' is not permitted. Only verified image/pdf formats are accepted.` };
        }
        extension = ALLOWED_MIMES[mimeType];
        fileBuffer = Buffer.from(match[2], 'base64');
      } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        if (trimmed.startsWith('http://')) {
          return { success: false, url: '', secure_url: '', error: 'Insecure plaintext HTTP image URLs are not permitted. Use HTTPS.' };
        }
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host === '0.0.0.0' ||
          host.startsWith('192.168.') ||
          host.startsWith('10.') ||
          host.startsWith('172.16.') ||
          host.startsWith('169.254.')
        ) {
          return { success: false, url: '', secure_url: '', error: 'Requests to internal network addresses are restricted.' };
        }

        const res = await fetch(trimmed);
        if (!res.ok) {
          return { success: false, url: '', secure_url: '', error: 'Failed to download remote file: ' + res.statusText };
        }
        const arrayBuf = await res.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
        const ct = res.headers.get('content-type');
        if (ct) {
          mimeType = ct.split(';')[0].trim().toLowerCase();
          if (mimeType.includes('png')) extension = 'png';
          else if (mimeType.includes('webp')) extension = 'webp';
          else if (mimeType.includes('gif')) extension = 'gif';
          else if (mimeType.includes('pdf')) extension = 'pdf';
        }
      } else {
        return { success: false, url: '', secure_url: '', error: 'Invalid image format: must be an HTTPS URL or base64 image data URI.' };
      }
    } else {
      return { success: false, url: '', secure_url: '', error: 'Invalid file input type.' };
    }

    const bucket = process.env.AWS_S3_BUCKET;
    const client = getS3Client();

    const safeFolder = /^[a-zA-Z0-9_-]{1,50}$/.test(folder) ? folder : 'products';
    const randSuffix = crypto.randomBytes(8).toString('hex');
    const objectKey = `${safeFolder}/${Date.now()}-${randSuffix}.${extension}`;

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await client.send(putCommand);

    // Compute permanent durable URL
    const durableUrl = getDurableImageUrl(objectKey);

    return {
      success: true,
      url: durableUrl,
      secure_url: durableUrl,
      key: objectKey,
      publicId: objectKey
    };
  } catch (err: any) {
    console.error('[AWS S3 Upload Error]:', err.message);
    return {
      success: false,
      url: '',
      secure_url: '',
      error: err.message || 'Failed to upload file to AWS S3'
    };
  }
}

// Backward-compatibility alias
export const uploadToCloudinary = uploadToS3;

/**
 * Checks whether an image URL is a persistent CDN or durable S3 reference.
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
  if (lower.includes('connect-vendor.onrender.com/uploads/')) {
    return false;
  }
  return lower.startsWith('http://') || lower.startsWith('https://');
}
