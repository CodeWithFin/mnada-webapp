import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { ensureBucket } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';

function extractStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  const pathWithQuery = url.substring(markerIndex + marker.length);
  return pathWithQuery.split('?')[0] || null;
}

function parseGalleryUrls(description?: string | null) {
  if (!description || !description.includes('---GALLERY_DATA---')) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(description.split('---GALLERY_DATA---')[1]);
    return Array.isArray(parsed) ? parsed.filter((url) => typeof url === 'string') : [];
  } catch {
    return [] as string[];
  }
}

function isBucketImageUrl(url: string) {
  return url.includes(`/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`);
}

function inferContentTypeAndExt(url: string, contentTypeHeader: string | null) {
  const contentType = (contentTypeHeader || '').toLowerCase();

  if (contentType.includes('image/jpeg')) return { contentType: 'image/jpeg', ext: 'jpg' };
  if (contentType.includes('image/png')) return { contentType: 'image/png', ext: 'png' };
  if (contentType.includes('image/webp')) return { contentType: 'image/webp', ext: 'webp' };
  if (contentType.includes('image/gif')) return { contentType: 'image/gif', ext: 'gif' };
  if (contentType.includes('image/avif')) return { contentType: 'image/avif', ext: 'avif' };

  const extFromUrl = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const fallbackType = extFromUrl === 'png'
    ? 'image/png'
    : extFromUrl === 'webp'
      ? 'image/webp'
      : extFromUrl === 'gif'
        ? 'image/gif'
        : extFromUrl === 'avif'
          ? 'image/avif'
          : 'image/jpeg';

  return { contentType: fallbackType, ext: extFromUrl };
}

async function migrateExternalUrlToBucket(externalUrl: string) {
  await ensureBucket(PRODUCT_IMAGES_BUCKET);
  const res = await fetch(externalUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch existing image URL (${res.status})`);
  }

  const { contentType, ext } = inferContentTypeAndExt(externalUrl, res.headers.get('content-type'));
  const fileBuffer = Buffer.from(await res.arrayBuffer());
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin
    .storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, fileBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType
    });

  if (uploadError) {
    throw new Error(`Failed to migrate existing image URL: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin
    .storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(uploadData.path);

  return publicUrlData.publicUrl;
}

async function ensureBucketImageUrls(urls: string[]) {
  const out: string[] = [];

  for (const url of urls) {
    if (!url) continue;
    if (isBucketImageUrl(url)) {
      out.push(url);
      continue;
    }

    const migrated = await migrateExternalUrlToBucket(url);
    out.push(migrated);
  }

  return out;
}

export async function POST(req: Request) {
  if (!(await verifyRoleRequest(req, 'admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const files = formData.getAll('images') as File[];
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';

    if (files.length === 0 || !name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uploadedImageUrls: string[] = [];
    const uploadedFilePaths: string[] = [];

    // Ensure bucket exists before uploading
    await ensureBucket(PRODUCT_IMAGES_BUCKET);

    // 1. Upload the images to Supabase Storage using Admin Client
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Clean up already uploaded images if one fails
        if (uploadedFilePaths.length > 0) {
          await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadedFilePaths);
        }
        return NextResponse.json({
          error: 'Failed to upload images',
          details: uploadError.message,
          bucket: PRODUCT_IMAGES_BUCKET
        }, { status: 500 });
      }

      uploadedFilePaths.push(uploadData.path);
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(uploadData.path);

      uploadedImageUrls.push(publicUrlData.publicUrl);
    }

    const mainImageUrl = uploadedImageUrls[0];
    const galleryDelimiter = "\n\n---GALLERY_DATA---";
    const enhancedDescription = `${description}${galleryDelimiter}${JSON.stringify(uploadedImageUrls)}`;

    // 3. Insert the new product into the database
    // Generates a mock_id for backwards compatibility with dynamic router
    const mockId = `new-${Date.now()}`;

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        mock_id: mockId,
        name: name,
        price: Number(price),
        image: mainImageUrl,
        main_image_url: mainImageUrl,
        category: category,
        description: enhancedDescription,
        is_new: isNew,
        sizes: ['S', 'M', 'L', 'XL'] // Defaulting for simple MVP
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Clean up the uploaded image if DB insert fails
      if (uploadedFilePaths.length > 0) {
        await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(uploadedFilePaths);
      }
      return NextResponse.json({
        error: 'Failed to insert product record',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    return NextResponse.json(insertData);

  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await verifyRoleRequest(req, 'admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const id = formData.get('id') as string;
    const files = formData.getAll('images') as File[];
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';

    if (!id || !name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newImageUrls: string[] = [];

    // Check if there are new images to upload
    if (files.length > 0 && files[0].size > 0 && files[0].name !== 'undefined') {
      await ensureBucket(PRODUCT_IMAGES_BUCKET);
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return NextResponse.json({ error: 'Failed to upload new images' }, { status: 500 });
        }

        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(uploadData.path);

        newImageUrls.push(publicUrlData.publicUrl);
      }
    }

    // Build update payload
    const updatePayload: any = {
      name: name,
      price: Number(price),
      category: category,
      description: description,
      is_new: isNew
    };

    // Parse existing images from formData
    const existingImagesStr = formData.get('existingImages') as string;
    let finalImages: string[] = [];
    if (existingImagesStr) {
      try {
        finalImages = JSON.parse(existingImagesStr);
      } catch (e) {
        console.error("Error parsing existingImages:", e);
      }
    }

    // Fallback: preserve current gallery when client doesn't send existingImages
    if (finalImages.length === 0) {
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('description')
        .eq('id', id)
        .single();

      if (existingProduct?.description?.includes("---GALLERY_DATA---")) {
        try {
          finalImages = JSON.parse(existingProduct.description.split("---GALLERY_DATA---")[1]);
        } catch (e) {
          console.error("Error parsing existing gallery data:", e);
        }
      }
    }

    // Put newly uploaded images first so the first uploaded becomes the primary product image.
    if (newImageUrls.length > 0) {
      finalImages = [...newImageUrls, ...finalImages];
    }

    // Remove duplicates while preserving order.
    if (finalImages.length > 0) {
      finalImages = Array.from(new Set(finalImages));
    }

    // Enforce bucket-backed images for all persisted gallery URLs.
    if (finalImages.length > 0) {
      finalImages = await ensureBucketImageUrls(finalImages);
    }

    if (finalImages.length > 0) {
      updatePayload.image = finalImages[0];
      updatePayload.main_image_url = finalImages[0];
      const galleryDelimiter = "\n\n---GALLERY_DATA---";
      updatePayload.description = `${description}${galleryDelimiter}${JSON.stringify(finalImages)}`;
    }

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ error: 'Failed to update product record' }, { status: 500 });
    }

    return NextResponse.json(updateData);

  } catch (error: any) {
    console.error("Error editing product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await verifyRoleRequest(req, 'admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    if (deleteAll) {
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, image, description, category')
        .neq('category', SYSTEM_AUTH_CATEGORY);

      if (productsError) {
        throw productsError;
      }

      const filesToRemove = new Set<string>();

      for (const product of products || []) {
        const urls = [
          ...(product.image ? [product.image] : []),
          ...parseGalleryUrls(product.description)
        ];

        for (const url of urls) {
          const filePath = extractStoragePathFromPublicUrl(url);
          if (filePath) {
            filesToRemove.add(filePath);
          }
        }
      }

      if (filesToRemove.size > 0) {
        await ensureBucket(PRODUCT_IMAGES_BUCKET);
        await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(Array.from(filesToRemove));
      }

      const { error: deleteError } = await supabaseAdmin
        .from('products')
        .delete()
        .neq('category', SYSTEM_AUTH_CATEGORY);

      if (deleteError) {
        throw deleteError;
      }

      return NextResponse.json({ success: true, deleted: products?.length || 0 });
    }

    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    // 1. Get the images before deleting
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('image, description')
      .eq('id', id)
      .single();

    if (product) {
      const allImages = [
        ...(product.image ? [product.image] : []),
        ...parseGalleryUrls(product.description)
      ];

      const filesToRemove = Array.from(
        new Set(
          allImages
            .map((url) => extractStoragePathFromPublicUrl(url))
            .filter((path): path is string => Boolean(path))
        )
      );

      if (filesToRemove.length > 0) {
        await ensureBucket(PRODUCT_IMAGES_BUCKET);
        await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(filesToRemove);
      }
    }

    // 3. Delete from database
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
