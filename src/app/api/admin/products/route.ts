import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'mnada2025'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    
    const file = formData.get('image') as File | null;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';

    if (!file || !name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upload the image to Supabase Storage using Admin Client (bypassing RLS)
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
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // 2. Get the public URL for the newly uploaded image
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('product-images')
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Insert the new product into the database
    // Generates a mock_id for backwards compatibility with dynamic router
    const mockId = `new-${Date.now()}`; 

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        mock_id: mockId,
        name: name,
        price: Number(price),
        image: imageUrl,
        main_image_url: imageUrl,
        category: category,
        description: description,
        is_new: isNew,
        sizes: ['S', 'M', 'L', 'XL'] // Defaulting for simple MVP
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Clean up the uploaded image if DB insert fails
      await supabaseAdmin.storage.from('product-images').remove([uploadData.path]);
      return NextResponse.json({ error: 'Failed to insert product record' }, { status: 500 });
    }

    return NextResponse.json(insertData);

  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'mnada2025'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    
    const id = formData.get('id') as string;
    const file = formData.get('image') as File | null;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';

    if (!id || !name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl = undefined; // Will stay undefined if no new image is uploaded

    // Check if there is a new image to upload
    if (file && file.size > 0 && file.name !== 'undefined') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return NextResponse.json({ error: 'Failed to upload new image' }, { status: 500 });
        }

        const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrlData.publicUrl;
    }

    // Build update payload
    const updatePayload: any = {
        name: name,
        price: Number(price),
        category: category,
        description: description,
        is_new: isNew
    };

    if (imageUrl) {
        updatePayload.image = imageUrl;
        updatePayload.main_image_url = imageUrl;
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
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'mnada2025'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    // 1. Get the image URL before deleting
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    if (product && product.image) {
      // Extract the filename from the public URL (assuming standard Supabase format)
      // e.g. https://[proj].supabase.co/storage/v1/object/public/product-images/123-abc.jpg
      const urlParts = product.image.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // 2. Delete from storage bucket
      await supabaseAdmin.storage.from('product-images').remove([fileName]);
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
