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

export function buildWhatsAppRedirectUrl(basePath, message, source) {
  const path = String(basePath || "").trim();
  const origin = typeof window !== "undefined" ? window.location?.origin : "";

  if (!path || !origin || origin === "null") {
    return "";
  }

  let url;

  try {
    url = new URL(path, origin);
  } catch {
    return "";
  }

  if (message) {
    url.searchParams.set("message", message);
  }

  if (source) {
    url.searchParams.set("source", source);
  }

  return url.toString();
}

export function buildPublicWhatsAppLink(contactConfig, options = {}) {
  const contact = contactConfig && typeof contactConfig === "object" ? contactConfig : {};
  const message = String(options.message || contact.whatsappDefaultMessage || "").trim();
  const source = String(options.source || "").trim();
  const mode = String(contact.whatsappMode || "direct").trim().toLowerCase();

  if (mode === "redirect") {
    return buildWhatsAppRedirectUrl(contact.whatsappRedirectPath, message, source);
  }

  return buildWhatsAppUrl(contact.whatsappNumber, message);
}
