import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyRoleRequest } from '@/lib/systemAuth';

export const dynamic = 'force-dynamic';

const CATEGORY_TABLE = 'categories';
const SYSTEM_AUTH_CATEGORY = 'SYSTEM_AUTH';
const CATEGORY_MARKER_PREFIX = 'CATEGORY::';

type ProductCategoryMarker = {
  id: string;
  name: string;
  created_at?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error';
}

function isMissingCategoriesTableError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybe = error as { code?: string; message?: string };
  return maybe.code === 'PGRST205' && (maybe.message || '').includes("public.categories");
}

function toMarkerName(categoryName: string) {
  return `${CATEGORY_MARKER_PREFIX}${categoryName.trim()}`;
}

function fromMarkerName(markerName: string) {
  if (!markerName.startsWith(CATEGORY_MARKER_PREFIX)) {
    return markerName;
  }
  return markerName.slice(CATEGORY_MARKER_PREFIX.length);
}

function parseMarkerRow(row: ProductCategoryMarker) {
  return {
    id: row.id,
    name: fromMarkerName(row.name),
    created_at: row.created_at
  };
}

async function getFallbackCategories() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, created_at')
    .eq('category', SYSTEM_AUTH_CATEGORY)
    .like('name', `${CATEGORY_MARKER_PREFIX}%`)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => parseMarkerRow(row as ProductCategoryMarker));
}

async function createFallbackCategory(name: string) {
  const trimmedName = name.trim();
  const markerName = toMarkerName(trimmedName);

  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id, name, created_at')
    .eq('category', SYSTEM_AUTH_CATEGORY)
    .eq('name', markerName)
    .maybeSingle();

  if (existing) {
    throw new Error('Category already exists');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: markerName,
      category: SYSTEM_AUTH_CATEGORY,
      description: 'CATEGORY_MARKER',
      price: 0,
      image: 'system-category-marker',
      main_image_url: 'system-category-marker',
      mock_id: `system-category-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      is_new: false,
      sizes: ['S', 'M', 'L', 'XL']
    })
    .select('id, name, created_at')
    .single();

  if (error) throw error;
  return parseMarkerRow(data as ProductCategoryMarker);
}

async function updateFallbackCategory(id: string, name: string) {
  const trimmedName = name.trim();
  const markerName = toMarkerName(trimmedName);

  const { data: duplicate } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('category', SYSTEM_AUTH_CATEGORY)
    .eq('name', markerName)
    .neq('id', id)
    .maybeSingle();

  if (duplicate) {
    throw new Error('Category already exists');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ name: markerName })
    .eq('id', id)
    .eq('category', SYSTEM_AUTH_CATEGORY)
    .like('name', `${CATEGORY_MARKER_PREFIX}%`)
    .select('id, name, created_at')
    .single();

  if (error) throw error;
  return parseMarkerRow(data as ProductCategoryMarker);
}

async function deleteFallbackCategory(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('category', SYSTEM_AUTH_CATEGORY)
    .like('name', `${CATEGORY_MARKER_PREFIX}%`);

  if (error) throw error;
}

async function verifyAuth(req: Request) {
  return Boolean(await verifyRoleRequest(req, 'admin'));
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(CATEGORY_TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (isMissingCategoriesTableError(error)) {
        const fallback = await getFallbackCategories();
        return NextResponse.json(fallback);
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from(CATEGORY_TABLE)
      .insert({ name })
      .select()
      .single();

    if (error) {
      if (isMissingCategoriesTableError(error)) {
        const fallbackCreated = await createFallbackCategory(name);
        return NextResponse.json(fallbackCreated);
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from(CATEGORY_TABLE)
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (isMissingCategoriesTableError(error)) {
        const fallbackUpdated = await updateFallbackCategory(id, name);
        return NextResponse.json(fallbackUpdated);
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from(CATEGORY_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      if (isMissingCategoriesTableError(error)) {
        await deleteFallbackCategory(id);
        return NextResponse.json({ success: true });
      }
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
