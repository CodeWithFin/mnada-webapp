import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const limit = searchParams.get("limit");

  let query: any = supabaseAdmin
    .from("journal_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (slug) {
    query = query.eq("slug", slug).single();
  } else if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data, error } = await query;

  if (error) {
    // Single query returns error if not found
    if (slug && error.code === 'PGRST116') {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
