import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret');
  } catch (e) {
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

    // 1. Upload the images to Supabase Storage using Admin Client
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Clean up already uploaded images if one fails
        if (uploadedFilePaths.length > 0) {
            await supabaseAdmin.storage.from('product-images').remove(uploadedFilePaths);
        }
        return NextResponse.json({ 
          error: 'Failed to upload images', 
          details: uploadError.message,
          bucket: 'product-images'
        }, { status: 500 });
      }

      uploadedFilePaths.push(uploadData.path);
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('product-images')
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
          await supabaseAdmin.storage.from('product-images').remove(uploadedFilePaths);
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
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret');
  } catch (e) {
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

    let newImageUrls: string[] = [];

    // Check if there are new images to upload
    if (files.length > 0 && files[0].size > 0 && files[0].name !== 'undefined') {
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
              console.error("Storage upload error:", uploadError);
              return NextResponse.json({ error: 'Failed to upload new images' }, { status: 500 });
            }

            const { data: publicUrlData } = supabaseAdmin
            .storage
            .from('product-images')
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

    // Append new images
    if (newImageUrls.length > 0) {
        finalImages = [...finalImages, ...newImageUrls];
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
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.SUPABASE_SERVICE_ROLE_KEY || 'mnada2025-fallback-secret');
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    // 1. Get the images before deleting
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('image, description')
      .eq('id', id)
      .single();

    if (product) {
      let galleryImages: string[] = [];
      if (product.description && product.description.includes("---GALLERY_DATA---")) {
        try {
          galleryImages = JSON.parse(product.description.split("---GALLERY_DATA---")[1]);
        } catch (e) {}
      }

      const allImages = [
        ...(product.image ? [product.image] : []),
        ...galleryImages
      ];

      // Unique images only
      const uniqueImages = Array.from(new Set(allImages));
      const filesToRemove: string[] = [];

      for (const imgUrl of uniqueImages) {
        const urlParts = imgUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        filesToRemove.push(fileName);
      }
      
      if (filesToRemove.length > 0) {
        await supabaseAdmin.storage.from('product-images').remove(filesToRemove);
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
