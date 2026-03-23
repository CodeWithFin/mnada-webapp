import { supabaseAdmin } from './supabaseAdmin';

/**
 * Ensures a Supabase Storage bucket exists.
 * If it doesn't, it creates it with public access.
 */
export async function ensureBucket(bucketName: string) {
  try {
    // We attempt to get the bucket first to see if it exists
    const { data: bucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);
    
    if (getError && getError.message.includes('Bucket not found')) {
      console.log(`Bucket ${bucketName} not found, creating it...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError && !createError.message.includes('already exists')) {
        console.error(`Error creating bucket ${bucketName}:`, createError.message);
        throw createError;
      }
      console.log(`Bucket ${bucketName} created successfully.`);
    } else if (getError) {
      console.error(`Error checking bucket ${bucketName}:`, getError.message);
    }
  } catch (error) {
    console.error(`Unexpected error in ensureBucket(${bucketName}):`, error);
  }
}
