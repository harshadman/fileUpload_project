import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadsDir = path.join(__dirname, '../uploads');
export const categoriesDir = {
  images: path.join(uploadsDir, 'images'),
  documents: path.join(uploadsDir, 'documents'),
  others: path.join(uploadsDir, 'others')
};

export const ensureUploadDirs = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(categoriesDir.images, { recursive: true });
  await fs.mkdir(categoriesDir.documents, { recursive: true });
  await fs.mkdir(categoriesDir.others, { recursive: true });
};

export const getFileCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.includes('pdf') || mimetype.includes('document') || 
      mimetype.includes('text') || mimetype.includes('sheet')) return 'documents';
  return 'others';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
