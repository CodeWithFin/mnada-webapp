/**
 * Sends an SMS via the Tilil Tech SMS gateway.
 * Phone numbers are normalised to the 254XXXXXXXXX format automatically.
 */
import { normalizePhone } from "@/lib/phone";

export async function sendSMS(mobile: string, message: string): Promise<void> {
  const apiKey = process.env.TILIL_API_KEY;
  const shortcode = process.env.TILIL_SHORTCODE;
  const endpoint = process.env.SMS_ENDPOINT;

  if (!apiKey || !shortcode || !endpoint) {
    console.error("Tilil SMS: missing environment variables (TILIL_API_KEY, TILIL_SHORTCODE, SMS_ENDPOINT)");
    return;
  }

  const payload = {
    api_key: apiKey,
    service_id: 0,
    mobile: normalizePhone(mobile),
    response_type: "json",
    shortcode: shortcode,
    message: message,
  };

  console.log("Tilil SMS: sending to", normalizePhone(mobile), "| payload:", JSON.stringify(payload));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log(`Tilil SMS: HTTP ${res.status} response:`, responseText);

  if (!res.ok) {
    throw new Error(`Tilil SMS HTTP ${res.status}: ${responseText}`);
  }

  // Tilil returns 200 even on errors — check the body
  try {
    const json = JSON.parse(responseText);
    // Tilil success responses have response_code "200" or status_code "1000"
    if (json.response_code && json.response_code !== "200" && json.response_code !== 200) {
      throw new Error(`Tilil SMS error: ${JSON.stringify(json)}`);
    }
    if (json.status_code && json.status_code !== "1000" && json.status_code !== 1000) {
      throw new Error(`Tilil SMS error: ${JSON.stringify(json)}`);
    }
  } catch (parseErr) {
    // If it's not valid JSON, just leave it — the raw log above captures it
    if (parseErr instanceof SyntaxError) return;
    throw parseErr;
  }
}
