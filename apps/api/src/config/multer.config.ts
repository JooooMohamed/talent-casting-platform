import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';

/**
 * Uses memory storage — required for Vercel (no writable disk).
 * Files land in memory as Buffer, then streamed to Cloudinary.
 */
export const multerConfig: MulterOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB
  },
};
