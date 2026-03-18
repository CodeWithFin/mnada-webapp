import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { phoneLookupCandidates } from "@/lib/phone";

export const dynamic = "force-dynamic";

function getBearerToken(req: Request): string {
  const authHeader = req.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
}

export async function GET(req: Request) {
  const token = getBearerToken(req);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
  
  if (userError || !userResult?.user) {
    console.error("Auth verification failed in /api/client/orders:", userError?.message || "No user found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phoneCandidates = phoneLookupCandidates(userResult.user.phone || "");
  const userEmail = userResult.user.email;

  let query = supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (*)
    `);

  // Filter by phone candidates OR email
  const filters = [];
  if (phoneCandidates.length > 0) {
    filters.push(`customer_phone.in.(${phoneCandidates.join(',')})`);
  }
  if (userEmail) {
    filters.push(`customer_email.eq.${userEmail}`);
  }

  if (filters.length > 0) {
    query = query.or(filters.join(','));
  } else {
    // If no identifiers, return empty
    return NextResponse.json([]);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Client orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
