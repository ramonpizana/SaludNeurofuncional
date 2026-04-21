const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

export function cleanText(value, fallback = "") {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

export function normalizePhoneNumber(rawValue, defaultCountryDialCode = "+52") {
  const source = cleanText(rawValue)
    .replace(/^whatsapp:/i, "")
    .replace(/[^\d+]/g, "");

  if (!source) {
    return "";
  }

  if (source.startsWith("+")) {
    return `+${source.slice(1).replace(/\D/g, "")}`;
  }

  const digits = source.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.length === 10 && defaultCountryDialCode) {
    const prefix = defaultCountryDialCode.replace(/[^\d+]/g, "");
    return `${prefix}${digits}`;
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return "";
}

export function maskPhoneNumber(value) {
  const normalized = normalizePhoneNumber(value);

  if (!normalized) {
    return "";
  }

  const suffix = normalized.slice(-4);
  const maskedLength = Math.max(normalized.length - 4, 0);
  return `${"*".repeat(maskedLength)}${suffix}`;
}

export function normalizeKeywordText(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "");
}

export function pickFirstName(value) {
  const fullName = cleanText(value);

  if (!fullName) {
    return "";
  }

  return fullName.split(/\s+/)[0];
}

export function escapeXml(value) {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatBookingDateTime(value, timezone = "America/Mexico_City", locale = "es-MX") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: "fecha por confirmar",
      timeLabel: "hora por confirmar"
    };
  }

  return {
    dateLabel: new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date),
    timeLabel: new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit"
    }).format(date)
  };
}
