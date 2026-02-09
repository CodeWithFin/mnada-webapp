import express from 'express';
import multer from 'multer';
import { supabase, STORAGE_BUCKET } from '../utils/supabase';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure bucket exists (public for read)
async function ensureBucket() {
  if (!supabase) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === STORAGE_BUCKET)) return;
  await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
}

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        message: 'Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in server/.env'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please provide an image file' });
    }

    await ensureBucket();

    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: error.message || 'Upload failed' });
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    res.json({
      url: data.publicUrl,
      path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
