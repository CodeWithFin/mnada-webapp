export function normalizePhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;

  return digits;
}

export function isValidPhoneForOtp(phone: string): boolean {
  const normalized = normalizePhone(phone);

  // E.164 max is 15 digits. We accept common local formats mapped by normalizePhone.
  return normalized.length >= 10 && normalized.length <= 15;
}

export function phoneLookupCandidates(phone: string): string[] {
  const normalized = normalizePhone(phone);
  const candidates = new Set<string>();

  if (!normalized) return [];

  candidates.add(normalized);

  if (normalized.startsWith("254") && normalized.length >= 10) {
    candidates.add(`0${normalized.slice(3)}`);
    candidates.add(`+${normalized}`);
  }

  return Array.from(candidates);
}
