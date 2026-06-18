import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const uploadsDir = join(process.cwd(), 'public', 'uploads');

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.heic',
  '.heif',
  '.svg',
  '.ico',
  '.pdf',
]);

const ALLOWED_MIME_PATTERN =
  /^image\/(jpeg|jpg|png|gif|webp|avif|heic|heif|svg\+xml|x-icon|vnd\.microsoft\.icon)$|^application\/pdf$/;

export const ensureUploadsDir = () => {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
};

export const multerDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_PATTERN.test(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  const octetPdf =
    ext === '.pdf' && file.mimetype === 'application/octet-stream';

  if (!mimeOk && !extOk && !octetPdf) {
    cb(new Error('فرمت فایل مجاز نیست'), false);
    return;
  }

  cb(null, true);
};

export const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024;
