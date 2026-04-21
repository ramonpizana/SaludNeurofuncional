import { cleanText, normalizePhoneNumber } from "./formatting.js";

const DEFAULTS = {
  clinicName: "Salud Neurofuncional",
  bookingUrl: "https://cal.com/ramon-pizana",
  siteUrl: "https://saludneurofuncional.pages.dev",
  timezone: "America/Mexico_City",
  locationLabel: "Consultorio Salud Neurofuncional",
  defaultCountryDialCode: "+52"
};

function normalizeWhatsAppFrom(rawValue, defaultCountryDialCode) {
  const source = cleanText(rawValue);

  if (!source) {
    return "";
  }

  if (source.startsWith("whatsapp:")) {
    const normalized = normalizePhoneNumber(source.slice("whatsapp:".length), defaultCountryDialCode);
    return normalized ? `whatsapp:${normalized}` : "";
  }

  const normalized = normalizePhoneNumber(source, defaultCountryDialCode);
  return normalized ? `whatsapp:${normalized}` : "";
}

export function getRuntimeConfig(env = {}) {
  const defaultCountryDialCode = cleanText(
    env.DEFAULT_COUNTRY_DIAL_CODE,
    DEFAULTS.defaultCountryDialCode
  );

  return {
    clinicName: cleanText(env.CLINIC_NAME, DEFAULTS.clinicName),
    bookingUrl: cleanText(env.CALCOM_BOOKING_URL, DEFAULTS.bookingUrl),
    siteUrl: cleanText(env.PUBLIC_SITE_URL, DEFAULTS.siteUrl),
    timezone: cleanText(env.CLINIC_TIMEZONE, DEFAULTS.timezone),
    locationLabel: cleanText(env.CLINIC_LOCATION_LABEL, DEFAULTS.locationLabel),
    defaultCountryDialCode,
    twilio: {
      accountSid: cleanText(env.TWILIO_ACCOUNT_SID),
      authToken: cleanText(env.TWILIO_AUTH_TOKEN),
      whatsappFrom: normalizeWhatsAppFrom(env.TWILIO_WHATSAPP_FROM, defaultCountryDialCode),
      messagingServiceSid: cleanText(env.TWILIO_MESSAGING_SERVICE_SID),
      contentSidByEvent: {
        BOOKING_CREATED: cleanText(env.TWILIO_CONTENT_SID_BOOKING_CREATED),
        BOOKING_RESCHEDULED: cleanText(env.TWILIO_CONTENT_SID_BOOKING_RESCHEDULED),
        BOOKING_CANCELLED: cleanText(env.TWILIO_CONTENT_SID_BOOKING_CANCELLED)
      }
    }
  };
}
