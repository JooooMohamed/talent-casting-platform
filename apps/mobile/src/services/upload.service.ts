import { api } from './api';
import axios from 'axios';
import { Platform } from 'react-native';

export type UploadProgress = (percent: number) => void;

/**
 * Upload a file directly to Cloudinary, then attach the resulting asset to
 * the authenticated talent profile. This keeps large video payloads away from
 * the serverless API.
 */
async function uploadFile(
  uri: string,
  fileName: string,
  mimeType: string,
  purpose: string,
  attachEndpoint: string,
  extraFields: Record<string, string> = {},
  onProgress?: UploadProgress,
): Promise<{ url: string; publicId: string }> {
  const { data: signatureResponse } = await api.post('/media/upload-signature', { purpose });
  const signature = signatureResponse.data;

  const formData = new FormData();

  formData.append('file', {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`;

  const { data } = await axios.post(cloudinaryUrl, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
    timeout: 5 * 60 * 1000, // 5 min for large videos
  });

  const asset = { url: data.secure_url, publicId: data.public_id };
  await api.request({
    method: attachEndpoint.includes('/portfolio/attach') ? 'POST' : 'PUT',
    url: attachEndpoint,
    data: { ...asset, ...extraFields },
  });

  return asset;
}

export const uploadService = {
  profilePhoto: (uri: string, fileName: string, onProgress?: UploadProgress) =>
    uploadFile(uri, fileName, 'image/jpeg', 'profile_photo', '/talents/me/photo', {}, onProgress),

  introVideo: (uri: string, fileName: string, onProgress?: UploadProgress) =>
    uploadFile(uri, fileName, 'video/mp4', 'intro_video', '/talents/me/videos/intro', {}, onProgress),

  sceneVideo: (uri: string, fileName: string, onProgress?: UploadProgress) =>
    uploadFile(uri, fileName, 'video/mp4', 'scene_video', '/talents/me/videos/scene', {}, onProgress),

  portfolioVideo: (uri: string, fileName: string, title: string, onProgress?: UploadProgress) =>
    uploadFile(uri, fileName, 'video/mp4', 'portfolio_video', '/talents/me/videos/portfolio/attach', { title }, onProgress),
};
