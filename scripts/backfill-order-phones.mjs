import { createClient } from "@supabase/supabase-js";

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let from = 0;
  const batchSize = 500;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const to = from + batchSize - 1;

    const { data: rows, error } = await supabase
      .from("orders")
      .select("id, customer_phone")
      .not("customer_phone", "is", null)
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    if (!rows || rows.length === 0) {
      break;
    }

    scanned += rows.length;

    for (const row of rows) {
      const currentPhone = row.customer_phone || "";
      const normalized = normalizePhone(currentPhone);

      if (!normalized || normalized === currentPhone) {
        continue;
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({ customer_phone: normalized })
        .eq("id", row.id);

      if (updateError) {
        console.error(`Failed to update order ${row.id}:`, updateError.message);
        continue;
      }

      updated += 1;
    }

    from += batchSize;
  }

  console.log(`Backfill complete. Scanned: ${scanned}, Updated: ${updated}`);
}

run().catch((error) => {
  console.error("Backfill script failed:", error.message || error);
  process.exit(1);
});
