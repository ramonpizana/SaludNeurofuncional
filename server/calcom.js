import { cleanText, formatBookingDateTime, normalizePhoneNumber } from "./formatting.js";

const encoder = new TextEncoder();
const PHONE_HINTS = ["phone", "telefono", "tel", "whatsapp", "mobile", "cel"];

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function readResponseValue(entry) {
  if (!entry) {
    return "";
  }

  if (typeof entry === "string") {
    return cleanText(entry);
  }

  if (typeof entry.value === "string") {
    return cleanText(entry.value);
  }

  if (entry.value && typeof entry.value === "object" && typeof entry.value.value === "string") {
    return cleanText(entry.value.value);
  }

  return "";
}

function findResponseValueByHints(responses, hints) {
  for (const [key, entry] of Object.entries(responses || {})) {
    const label = cleanText(entry?.label).toLowerCase();
    const fieldKey = cleanText(key).toLowerCase();
    const haystack = `${fieldKey} ${label}`;

    if (!hints.some((hint) => haystack.includes(hint))) {
      continue;
    }

    const value = readResponseValue(entry);

    if (value) {
      return value;
    }
  }

  return "";
}

function extractPhoneFromResponses(responses, defaultCountryDialCode) {
  for (const [key, entry] of Object.entries(responses || {})) {
    const label = cleanText(entry?.label).toLowerCase();
    const fieldKey = cleanText(key).toLowerCase();
    const haystack = `${fieldKey} ${label}`;

    if (!PHONE_HINTS.some((hint) => haystack.includes(hint))) {
      continue;
    }

    const value = readResponseValue(entry);
    const normalized = normalizePhoneNumber(value, defaultCountryDialCode);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

export async function verifyCalcomSignature(rawBody, secret, receivedSignature) {
  const signature = cleanText(receivedSignature).toLowerCase();

  if (!secret || !signature) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedSignature = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0")
  ).join("");

  return timingSafeEqual(expectedSignature, signature);
}

export function extractBookingFromCalcom(body, options = {}) {
  const payload =
    body && typeof body.payload === "object" && body.payload !== null ? body.payload : body || {};
  const responses = payload.responses && typeof payload.responses === "object" ? payload.responses : {};
  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendee = attendees.find(Boolean) || {};

  const attendeeName =
    cleanText(attendee.name) ||
    findResponseValueByHints(responses, ["name", "nombre"]) ||
    "Paciente";
  const attendeeEmail =
    cleanText(attendee.email) || findResponseValueByHints(responses, ["email", "correo"]);
  const attendeePhone =
    normalizePhoneNumber(attendee.phoneNumber, options.defaultCountryDialCode) ||
    extractPhoneFromResponses(responses, options.defaultCountryDialCode);
  const locale = cleanText(
    attendee.language?.locale || payload.organizer?.language?.locale,
    "es-MX"
  );
  const timezone = cleanText(
    attendee.timeZone || payload.organizer?.timeZone,
    options.timezone || "America/Mexico_City"
  );
  const managementUrl = cleanText(payload.bookerUrl, options.defaultBookingUrl || "");
  const { dateLabel, timeLabel } = formatBookingDateTime(payload.startTime, timezone, locale);

  return {
    triggerEvent: cleanText(body?.triggerEvent),
    bookingId: cleanText(String(payload.bookingId || payload.uid || payload.bookingUid || "")),
    attendeeName,
    attendeeEmail,
    attendeePhone,
    locale,
    timezone,
    title: cleanText(payload.eventTitle || payload.title, "Cita"),
    startTime: cleanText(payload.startTime),
    endTime: cleanText(payload.endTime),
    dateLabel,
    timeLabel,
    managementUrl,
    cancellationReason: cleanText(payload.cancellationReason),
    location: cleanText(payload.location)
  };
}
