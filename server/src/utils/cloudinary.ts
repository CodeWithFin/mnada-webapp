import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

// Upload file to Cloudinary
export async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'mnada',
          public_id: filename.split('.')[0], // Remove extension for public_id
          overwrite: true,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw error;
  }
}

// Generate unique filename
export function generateFilename(originalFilename: string): string {
  const ext = originalFilename.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return `${timestamp}-${random}.${ext}`;
}

export default cloudinary;