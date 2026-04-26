export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const VIDEO_LIMITS = {
  FREE_PORTFOLIO_COUNT: 0,
  PRO_PORTFOLIO_COUNT: 5,
  MAX_FILE_SIZE_MB: 200,
  ALLOWED_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
};

export const IMAGE_LIMITS = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
};

export const JWT = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
};

export const API_PREFIX = '/api/v1';

export const CLOUDINARY_FOLDERS = {
  PROFILE_PHOTOS: 'talent-casting/profile-photos',
  INTRO_VIDEOS: 'talent-casting/intro-videos',
  SCENE_VIDEOS: 'talent-casting/scene-videos',
  PORTFOLIO_VIDEOS: 'talent-casting/portfolio-videos',
  COMPANY_LOGOS: 'talent-casting/company-logos',
};
