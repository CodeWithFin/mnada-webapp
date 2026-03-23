import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';
import { ensureBucket } from '@/lib/storage';

const CATEGORIES_BUCKET = 'categories';

export async function GET(req: Request) {
  try {
    // GET categories logic (accessible to all roles for product creation/browsing)

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Self-seeding if empty
    if (data.length === 0) {
      console.log('Seeding initial categories...');
      const initialCategories = [
        { name: 'Mens', slug: 'men', hero_image_url: 'https://images.unsplash.com/photo-1630922199795-e40a1cff7f88?q=80&w=2037&auto=format&fit=crop' },
        { name: 'Womens', slug: 'women', hero_image_url: 'https://images.unsplash.com/photo-1531469535976-c6fc3604014f?q=80&w=1335&auto=format&fit=crop' },
        { name: 'Accessories', slug: 'accessories', hero_image_url: 'https://images.unsplash.com/photo-1586878341523-7acb55eb8c12?q=80&w=2340&auto=format&fit=crop' }
      ];
      
      const { data: seededData, error: seedError } = await supabaseAdmin
        .from('categories')
        .insert(initialCategories)
        .select();
      
      if (!seedError) return NextResponse.json(seededData);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await verifyRoleRequest(req, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    let hero_image_url = formData.get('hero_image_url') as string || '';
    const imageFile = formData.get('image') as File | null;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Handle server-side image upload if a file was provided
    if (imageFile && imageFile.size > 0) {
      await ensureBucket(CATEGORIES_BUCKET);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(CATEGORIES_BUCKET)
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Failed to upload hero image: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(CATEGORIES_BUCKET)
        .getPublicUrl(filePath);
      
      hero_image_url = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug: slug.toLowerCase(), hero_image_url })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in POST /api/admin/categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await verifyRoleRequest(req, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    let hero_image_url = formData.get('hero_image_url') as string || '';
    const imageFile = formData.get('image') as File | null;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'ID, name and slug are required' }, { status: 400 });
    }

    // Handle server-side image upload if a new file was provided
    if (imageFile && imageFile.size > 0) {
      await ensureBucket(CATEGORIES_BUCKET);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(CATEGORIES_BUCKET)
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error(`Failed to upload new hero image: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(CATEGORIES_BUCKET)
        .getPublicUrl(filePath);
      
      hero_image_url = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, slug: slug.toLowerCase(), hero_image_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in PUT /api/admin/categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyRoleRequest(req, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
