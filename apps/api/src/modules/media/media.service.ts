import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new InternalServerErrorException('Image upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          chunk_size: 6000000,
        },
        (error, result: UploadApiResponse) => {
          if (error) return reject(new InternalServerErrorException('Video upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }

  async deleteAsset(publicId: string, resourceType: 'image' | 'video' = 'video'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }

  getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [{ width: 400, height: 225, crop: 'fill', format: 'jpg' }],
    });
  }
}
