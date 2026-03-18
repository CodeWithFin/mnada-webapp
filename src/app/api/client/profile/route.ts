import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ProfilePayload = {
  first_name?: string;
  last_name?: string;
  shipping_address?: string;
  shipping_apartment?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_phone?: string;
};

function getBearerToken(req: Request): string {
  const auth = req.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : "";
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userResult?.user) {
    console.error("Auth verification failed in /api/client/profile:", userError?.message || "No user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("customer_profiles")
    .select("first_name, last_name, shipping_address, shipping_apartment, shipping_city, shipping_postal_code, shipping_phone")
    .eq("id", userResult.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || {});
}

export async function PUT(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userResult?.user) {
    console.error("Auth verification failed in /api/client/profile:", userError?.message || "No user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: ProfilePayload = await req.json();

  const allowed: ProfilePayload = {
    first_name: body.first_name?.trim() ?? undefined,
    last_name: body.last_name?.trim() ?? undefined,
    shipping_address: body.shipping_address?.trim() ?? undefined,
    shipping_apartment: body.shipping_apartment?.trim() ?? undefined,
    shipping_city: body.shipping_city?.trim() ?? undefined,
    shipping_postal_code: body.shipping_postal_code?.trim() ?? undefined,
    shipping_phone: body.shipping_phone?.trim() ?? undefined,
  };

  // Remove undefined keys so we don't overwrite existing values with null
  const updates = Object.fromEntries(
    Object.entries(allowed).filter(([, v]) => v !== undefined)
  );

  const { data, error } = await supabaseAdmin
    .from("customer_profiles")
    .upsert({ id: userResult.user.id, ...updates })
    .select("first_name, last_name, shipping_address, shipping_apartment, shipping_city, shipping_postal_code, shipping_phone")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
