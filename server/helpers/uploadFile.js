import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder ? req.body.folder.toLowerCase() : 'amenities'; 
    const uploadPath = path.join('public/images', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Init upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 } // 5 MB limit
});
