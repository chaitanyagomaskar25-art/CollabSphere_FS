import multer from "multer";
import path from "path";
import crypto from 'crypto'
import fs from 'fs'


const uploadDir = '/tmp/collabsphere_uploads';

fs.mkdirSync(uploadDir, { recursive: true });

// Disallowed executable extensions for security
const BLOCKED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".bin",
  ".msi",
  ".com",
  ".scr",
  ".vbs",
  ".wsf",
];


const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(
        `Files with extension '${ext}' are restricted for security reasons`,
      ),
      false,
    );
  }
 return cb(null, true);
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe storage identifier
    const randomId = crypto.randomBytes(16).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${Date.now()}-${randomId}${safeExt}`);
  },
});


export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

