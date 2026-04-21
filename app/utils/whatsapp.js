export function cleanWhatsAppNumber(number) {
  return String(number || "").replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl(number, message) {
  const cleanNumber = cleanWhatsAppNumber(number);

  if (!cleanNumber) {
    return "";
  }

  const url = new URL(`https://wa.me/${cleanNumber}`);

  if (message) {
    url.searchParams.set("text", message);
  }

  return url.toString();
}
