import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { verifyRoleRequest } from "@/lib/systemAuth";
import { ensureBucket } from "@/lib/storage";

// Helper to verify admin token
async function verifyAdmin(request: Request) {
  return Boolean(await verifyRoleRequest(request, 'admin'));
}

const JOURNAL_IMAGES_BUCKET = 'journal-images';

function extractStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${JOURNAL_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  const pathWithQuery = url.substring(markerIndex + marker.length);
  return pathWithQuery.split('?')[0] || null;
}

async function uploadImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  await ensureBucket(JOURNAL_IMAGES_BUCKET);

  const { data: uploadData, error: uploadError } = await supabaseAdmin
    .storage
    .from(JOURNAL_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin
    .storage
    .from(JOURNAL_IMAGES_BUCKET)
    .getPublicUrl(uploadData!.path);

  return publicUrlData.publicUrl;
}


export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("journal_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const tag = formData.get("tag") as string;
    const date = formData.get("date") as string;
    const read_time = formData.get("read_time") as string;
    const is_featured = formData.get("is_featured") === "true";
    const contentStr = formData.get("content") as string;
    const content = JSON.parse(contentStr);
    const imageFile = formData.get("image") as File;

    let imageUrl = "";
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (uploadErr: any) {
        console.error("Image upload failed in POST:", uploadErr);
        return NextResponse.json({ error: "Image upload failed: " + uploadErr.message }, { status: 500 });
      }
    }

    let payload: any = { title, slug, excerpt, image: imageUrl, tag, date, read_time, content, is_featured };
    
    let { data, error } = await supabaseAdmin
      .from("journal_posts")
      .insert([payload])
      .select()
      .single();

    // If it fails because of is_featured column missing, retry without it
    if (error && (error.message.includes("is_featured") || error.details?.includes("is_featured"))) {
      console.warn("Retrying POST without is_featured due to missing column");
      delete payload.is_featured;
      const retry = await supabaseAdmin
        .from("journal_posts")
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Database error in POST /api/admin/journal:", error);
      return NextResponse.json({ error: "Database error: " + error.message, details: error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Unexpected error in POST /api/admin/journal:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const tag = formData.get("tag") as string;
    const date = formData.get("date") as string;
    const read_time = formData.get("read_time") as string;
    const is_featured = formData.get("is_featured") === "true";
    const contentStr = formData.get("content") as string;
    const content = JSON.parse(contentStr);
    const imageFile = formData.get("image") as File;
    const existingImage = formData.get("existingImage") as string;

    let imageUrl = existingImage;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (uploadErr: any) {
        return NextResponse.json({ error: "Image upload failed: " + uploadErr.message }, { status: 500 });
      }
      
      // Cleanup old image if it was in our bucket
      if (existingImage) {
        const oldPath = extractStoragePathFromPublicUrl(existingImage);
        if (oldPath) {
          await supabaseAdmin.storage.from(JOURNAL_IMAGES_BUCKET).remove([oldPath]);
        }
      }
    }

    let payload: any = { title, slug, excerpt, image: imageUrl, tag, date, read_time, content, is_featured, updated_at: new Date() };

    let { data, error } = await supabaseAdmin
      .from("journal_posts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    // If it fails because of is_featured column missing, retry without it
    if (error && (error.message.includes("is_featured") || error.details?.includes("is_featured"))) {
      console.warn("Retrying PUT without is_featured due to missing column");
      delete payload.is_featured;
      const retry = await supabaseAdmin
        .from("journal_posts")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Database error in PUT /api/admin/journal:", error);
      return NextResponse.json({ error: "Database error: " + error.message, details: error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Unexpected error in PUT /api/admin/journal:", err);
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Get post to find image URL for cleanup
  const { data: post } = await supabaseAdmin
    .from("journal_posts")
    .select("image")
    .eq("id", id)
    .single();

  if (post?.image) {
    const path = extractStoragePathFromPublicUrl(post.image);
    if (path) {
      await supabaseAdmin.storage.from(JOURNAL_IMAGES_BUCKET).remove([path]);
    }
  }

  const { error } = await supabaseAdmin
    .from("journal_posts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
