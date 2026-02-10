import express from 'express';
import multer from 'multer';
import { uploadToCloudinary, generateFilename, MAX_FILE_SIZE } from '../utils/cloudinary';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide an image file' });
    }

    const filename = generateFilename(req.file.originalname);
    
    const imageUrl = await uploadToCloudinary(req.file.buffer, filename);

    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
