// Backward-compatibility shim: re-exports S3 implementation aliased as Cloudinary
export {
  uploadToS3 as uploadToCloudinary,
  uploadToS3,
  getPresignedViewUrl,
  getDurableImageUrl,
  resolveDurableImageUrl,
  extractS3Key,
  isPersistentImageUrl
} from './s3';
