"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPersistentImageUrl = exports.extractS3Key = exports.resolveDurableImageUrl = exports.getDurableImageUrl = exports.getPresignedViewUrl = exports.uploadToS3 = exports.uploadToCloudinary = void 0;
// Backward-compatibility shim: re-exports S3 implementation aliased as Cloudinary
var s3_1 = require("./s3");
Object.defineProperty(exports, "uploadToCloudinary", { enumerable: true, get: function () { return s3_1.uploadToS3; } });
Object.defineProperty(exports, "uploadToS3", { enumerable: true, get: function () { return s3_1.uploadToS3; } });
Object.defineProperty(exports, "getPresignedViewUrl", { enumerable: true, get: function () { return s3_1.getPresignedViewUrl; } });
Object.defineProperty(exports, "getDurableImageUrl", { enumerable: true, get: function () { return s3_1.getDurableImageUrl; } });
Object.defineProperty(exports, "resolveDurableImageUrl", { enumerable: true, get: function () { return s3_1.resolveDurableImageUrl; } });
Object.defineProperty(exports, "extractS3Key", { enumerable: true, get: function () { return s3_1.extractS3Key; } });
Object.defineProperty(exports, "isPersistentImageUrl", { enumerable: true, get: function () { return s3_1.isPersistentImageUrl; } });
