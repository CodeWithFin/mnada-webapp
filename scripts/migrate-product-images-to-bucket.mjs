import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';
const GALLERY_DELIMITER = '\n\n---GALLERY_DATA---';
const DRY_RUN = process.argv.includes('--dry-run');

function isBucketUrl(url) {
  return typeof url === 'string' && url.includes(`/storage/v1/object/public/${BUCKET}/`);
}

function extractDescriptionAndGallery(description, fallbackMainImage) {
  const rawDescription = typeof description === 'string' ? description : '';

  if (!rawDescription.includes('---GALLERY_DATA---')) {
    const initialGallery = fallbackMainImage ? [fallbackMainImage] : [];
    return {
      text: rawDescription.trim(),
      gallery: initialGallery
    };
  }

  const parts = rawDescription.split('---GALLERY_DATA---');
  const text = (parts[0] || '').trim();
  const galleryRaw = parts[1] || '[]';

  try {
    const parsed = JSON.parse(galleryRaw);
    const gallery = Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.length > 0) : [];
    return { text, gallery };
  } catch {
    return {
      text,
      gallery: fallbackMainImage ? [fallbackMainImage] : []
    };
  }
}

function detectExtensionFromUrl(url) {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).replace('.', '').toLowerCase();
    if (ext) {
      return ext;
    }
  } catch {
    return '';
  }
  return '';
}

function detectExtensionFromContentType(contentType) {
  if (!contentType) return '';
  const ct = contentType.toLowerCase();
  if (ct.includes('image/jpeg')) return 'jpg';
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/gif')) return 'gif';
  if (ct.includes('image/avif')) return 'avif';
  return '';
}

async function copyExternalImageToBucket(productId, imageIndex, externalUrl) {
  const response = await fetch(externalUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const ext = detectExtensionFromContentType(contentType) || detectExtensionFromUrl(externalUrl) || 'jpg';

  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const fileName = `legacy-${productId}-${imageIndex}-${Date.now()}.${ext}`;
  const uploadPath = fileName;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, fileBuffer, {
      contentType,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
  return publicData.publicUrl;
}

async function run() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category, image, main_image_url, description')
    .neq('category', 'SYSTEM_AUTH')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('No products found.');
    return;
  }

  console.log(`Found ${products.length} products.`);

  let touchedProducts = 0;
  let migratedImageCount = 0;
  const failedImages = [];

  for (const product of products) {
    const primaryImage = product.main_image_url || product.image || '';
    const parsed = extractDescriptionAndGallery(product.description, primaryImage);

    const gallery = parsed.gallery.length > 0 ? parsed.gallery : (primaryImage ? [primaryImage] : []);
    const currentPrimary = primaryImage || gallery[0] || '';

    if (!currentPrimary && gallery.length === 0) {
      continue;
    }

    const remappedUrlCache = new Map();
    let changed = false;

    async function resolveUrl(url, index) {
      if (!url) return url;
      if (isBucketUrl(url)) return url;

      if (remappedUrlCache.has(url)) {
        return remappedUrlCache.get(url);
      }

      if (DRY_RUN) {
        const preview = `[DRY_RUN] would migrate ${url}`;
        remappedUrlCache.set(url, preview);
        return preview;
      }

      let migratedUrl = url;
      try {
        migratedUrl = await copyExternalImageToBucket(product.id, index, url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown migration error';
        failedImages.push({
          productId: product.id,
          productName: product.name,
          url,
          error: message
        });
        console.error(`Skipping URL for product ${product.id}: ${message}`);
      }

      remappedUrlCache.set(url, migratedUrl);
      if (migratedUrl !== url) {
        migratedImageCount += 1;
      }
      return migratedUrl;
    }

    const newGallery = [];
    for (let i = 0; i < gallery.length; i += 1) {
      const originalUrl = gallery[i];
      const migratedUrl = await resolveUrl(originalUrl, i);
      if (migratedUrl !== originalUrl) {
        changed = true;
      }
      newGallery.push(migratedUrl);
    }

    let newPrimary = currentPrimary;
    const resolvedPrimary = await resolveUrl(currentPrimary, 9999);
    if (resolvedPrimary !== currentPrimary) {
      changed = true;
      newPrimary = resolvedPrimary;
    }

    if (!changed) {
      continue;
    }

    touchedProducts += 1;

    if (DRY_RUN) {
      console.log(`[DRY_RUN] Product ${product.id} (${product.name}) would be updated.`);
      continue;
    }

    const newDescription = `${parsed.text}${GALLERY_DELIMITER}${JSON.stringify(newGallery)}`;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        image: newPrimary,
        main_image_url: newPrimary,
        description: newDescription
      })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Failed to update product ${product.id}:`, updateError.message);
      continue;
    }

    console.log(`Updated product ${product.id} (${product.name}).`);
  }

  console.log(`Done. Products updated: ${touchedProducts}. Images migrated: ${migratedImageCount}.`);
  if (failedImages.length > 0) {
    console.log(`Images that could not be migrated: ${failedImages.length}`);
    for (const failed of failedImages) {
      console.log(`- ${failed.productId} (${failed.productName}): ${failed.url} -> ${failed.error}`);
    }
  }
  if (DRY_RUN) {
    console.log('Dry-run mode only; no changes were written.');
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
