import { cleanText, normalizePhoneNumber } from "./formatting.js";

const DEFAULTS = {
  clinicName: "Salud Neurofuncional",
  bookingUrl: "https://cal.com/ramon-pizana",
  siteUrl: "https://saludneurofuncional.pages.dev",
  timezone: "America/Mexico_City",
  locationLabel: "Consultorio Salud Neurofuncional",
  defaultCountryDialCode: "+52",
  whatsappProvider: "twilio",
  metaApiVersion: "v25.0",
  metaTemplateLanguageCode: "en_US"
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
    whatsappProvider: cleanText(env.WHATSAPP_PROVIDER, DEFAULTS.whatsappProvider).toLowerCase(),
    contactGateway: {
      redirectNumber: normalizePhoneNumber(env.WHATSAPP_REDIRECT_NUMBER, defaultCountryDialCode)
    },
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
    },
    meta: {
      appSecret: cleanText(env.META_APP_SECRET),
      accessToken: cleanText(env.META_WHATSAPP_ACCESS_TOKEN),
      phoneNumberId: cleanText(env.META_WHATSAPP_PHONE_NUMBER_ID),
      businessAccountId: cleanText(env.META_WHATSAPP_BUSINESS_ACCOUNT_ID),
      verifyToken: cleanText(env.META_WHATSAPP_VERIFY_TOKEN),
      apiVersion: cleanText(env.META_WHATSAPP_API_VERSION, DEFAULTS.metaApiVersion),
      templateLanguageCode: cleanText(
        env.META_TEMPLATE_LANGUAGE_CODE,
        DEFAULTS.metaTemplateLanguageCode
      ),
      templateNameByEvent: {
        BOOKING_CREATED: cleanText(env.META_TEMPLATE_BOOKING_CREATED),
        BOOKING_RESCHEDULED: cleanText(env.META_TEMPLATE_BOOKING_RESCHEDULED),
        BOOKING_CANCELLED: cleanText(env.META_TEMPLATE_BOOKING_CANCELLED)
      }
    }
  };
}
