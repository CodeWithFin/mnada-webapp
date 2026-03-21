import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

async function verifySeller(req: Request) {
  return await verifyRoleRequest(req, 'seller');
}

export async function GET(req: Request) {
  const sellerPayload = await verifySeller(req);
  if (!sellerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('seller_id', sellerPayload.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const sellerPayload = await verifySeller(req);
  if (!sellerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';
    const images = formData.getAll('images') as File[];

    if (!name || !price || !category || images.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload images logic (simplified for seller, reusing logic from admin products if possible)
    // Actually, I'll need to implement the upload here or refactor.
    // For now, I'll implement a basic version.
    
    const imageUrls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, image);

      if (uploadError) {
        return NextResponse.json({ error: 'Failed to upload image: ' + uploadError.message }, { status: 500 });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      imageUrls.push(publicUrl);
    }

    const mainImageUrl = imageUrls[0];
    const enhancedDescription = images.length > 1 
      ? `${description}\n\n---GALLERY_DATA---${JSON.stringify(imageUrls)}`
      : description;

    const mockId = `MND-${nanoid(6).toUpperCase()}`;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        mock_id: mockId,
        name,
        price: Number(price),
        image: mainImageUrl,
        main_image_url: mainImageUrl,
        category,
        description: enhancedDescription,
        is_new: isNew,
        seller_id: sellerPayload.id,
        sizes: ['S', 'M', 'L', 'XL']
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const sellerPayload = await verifySeller(req);
  if (!sellerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isNew = formData.get('isNew') === 'true';
    const newImages = formData.getAll('images') as File[];
    const existingImagesStr = formData.get('existingImages') as string;
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError || existingProduct?.seller_id !== sellerPayload.id) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    let imageUrls = [...existingImages];

    // Upload new images
    for (const image of newImages) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, image);

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }
    }

    const mainImageUrl = imageUrls[0];
    const enhancedDescription = imageUrls.length > 1 
      ? `${description}\n\n---GALLERY_DATA---${JSON.stringify(imageUrls)}`
      : description;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        price: Number(price),
        image: mainImageUrl,
        main_image_url: mainImageUrl,
        category,
        description: enhancedDescription,
        is_new: isNew,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq('seller_id', sellerPayload.id) // Extra safety
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const sellerPayload = await verifySeller(req);
  if (!sellerPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', sellerPayload.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
