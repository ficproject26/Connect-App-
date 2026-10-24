import crypto from 'crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

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
  error?: string;
}

export async function getPresignedViewUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!key || typeof key !== 'string') return '';
  const bucket = process.env.AWS_S3_BUCKET;
  const client = getS3Client();

  if (key.startsWith('http://') || key.startsWith('https://')) {
    if (key.includes('X-Amz-Signature') || key.includes('X-Amz-Credential')) {
      return key;
    }
    const match = key.match(/amazonaws\.com\/(.+)$/);
    if (match && match[1]) {
      key = decodeURIComponent(match[1]);
    } else {
      return key;
    }
  }

  const cleanKey = key.replace(/^\/+/, '');
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: cleanKey
  });

  return await getSignedUrl(client, command, { expiresIn });
}

export async function uploadToS3(
  fileInput: string | Buffer,
  folder = 'products'
): Promise<S3UploadResult> {
  try {
    const bucket = process.env.AWS_S3_BUCKET;
    const client = getS3Client();

    let fileBuffer: Buffer;
    let mimeType = 'image/jpeg';
    let extension = 'jpg';

    if (Buffer.isBuffer(fileInput)) {
      fileBuffer = fileInput;
    } else if (typeof fileInput === 'string') {
      const trimmed = fileInput.trim();

      if (trimmed.includes('amazonaws.com') && (trimmed.includes('X-Amz-Signature') || trimmed.includes(bucket || ''))) {
        return { success: true, url: trimmed, secure_url: trimmed, key: trimmed, publicId: trimmed };
      }

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
          return { success: false, url: '', secure_url: '', error: 'MIME type ' + mimeType + ' is not permitted. Only verified image/pdf formats are accepted.' };
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

    const safeFolder = /^[a-zA-Z0-9_-]{1,50}$/.test(folder) ? folder : 'products';
    const randSuffix = crypto.randomBytes(8).toString('hex');
    const objectKey = safeFolder + '/' + Date.now() + '-' + randSuffix + '.' + extension;

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await client.send(putCommand);

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey
    });
    const presignedUrl = await getSignedUrl(client, getCommand, { expiresIn: 604800 });

    return {
      success: true,
      url: presignedUrl,
      secure_url: presignedUrl,
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

export const uploadToCloudinary = uploadToS3;

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