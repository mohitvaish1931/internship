import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter to validate Video and Image attachments
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format not supported. Only common video and image types allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Max 100MB video size limits
  }
});

export default upload;
