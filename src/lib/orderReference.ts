type OrderReferenceInput = {
  id: string;
  created_at?: string | null;
};

function formatDatePart(createdAt?: string | null) {
  if (!createdAt) {
    return '000000';
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '000000';
  }

  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getOrderReference(order: OrderReferenceInput) {
  const compactId = order.id.replace(/-/g, '').toUpperCase();
  const datePart = formatDatePart(order.created_at);
  const codePart = `${compactId.slice(0, 2)}${compactId.slice(10, 12)}${compactId.slice(-4)}`;
  return `MN-${datePart}-${codePart}`;
}
