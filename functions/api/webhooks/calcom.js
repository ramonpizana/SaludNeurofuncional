import { extractBookingFromCalcom, verifyCalcomSignature } from "../../../server/calcom.js";
import { maskPhoneNumber } from "../../../server/formatting.js";
import { sendMetaTemplateMessage } from "../../../server/meta-whatsapp.js";
import { getContentLength, hasAllowedContentType } from "../../../server/request-guards.js";
import { getRuntimeConfig } from "../../../server/runtime-config.js";
import { sendWhatsAppTemplate } from "../../../server/twilio.js";

const SUPPORTED_EVENTS = new Set([
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED"
]);
const MAX_CALCOM_WEBHOOK_BYTES = 256 * 1024;

function isTwilioReady(config) {
  return Boolean(
    config.twilio.accountSid &&
      config.twilio.authToken &&
      (config.twilio.whatsappFrom || config.twilio.messagingServiceSid)
  );
}

function isMetaReady(config) {
  return Boolean(config.meta.accessToken && config.meta.phoneNumberId);
}

function getActiveProvider(config) {
  return config.whatsappProvider === "meta" ? "meta" : "twilio";
}

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function ensureTwilioReady(config) {
  return isTwilioReady(config);
}

function ensureMetaReady(config) {
  return isMetaReady(config);
}

function buildContentVariables(triggerEvent, booking, config) {
  if (triggerEvent === "BOOKING_CANCELLED") {
    return {
      1: booking.attendeeName,
      2: config.clinicName,
      3: config.bookingUrl || config.siteUrl
    };
  }

  return {
    1: booking.attendeeName,
    2: config.clinicName,
    3: booking.dateLabel,
    4: booking.timeLabel,
    5: booking.managementUrl || config.bookingUrl || config.siteUrl
  };
}

export const onRequestGet = async ({ env }) => {
  const config = getRuntimeConfig(env);
  const provider = getActiveProvider(config);

  return jsonResponse({
    ok: true,
    endpoint: "calcom-webhook",
    provider,
    supportedEvents: [...SUPPORTED_EVENTS],
    twilioReady: ensureTwilioReady(config),
    metaReady: ensureMetaReady(config),
    templates:
      provider === "meta"
        ? Object.fromEntries(
            [...SUPPORTED_EVENTS].map((eventName) => [
              eventName,
              Boolean(config.meta.templateNameByEvent[eventName])
            ])
          )
        : Object.fromEntries(
            [...SUPPORTED_EVENTS].map((eventName) => [
              eventName,
              Boolean(config.twilio.contentSidByEvent[eventName])
            ])
          ),
    requiresPhoneCollection: true
  });
};

export const onRequestPost = async ({ request, env }) => {
  const config = getRuntimeConfig(env);
  const provider = getActiveProvider(config);

  if (!env.CALCOM_WEBHOOK_SECRET) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing CALCOM_WEBHOOK_SECRET in Cloudflare Pages secrets."
      },
      500
    );
  }

  if (provider === "meta" && !ensureMetaReady(config)) {
    return jsonResponse(
      {
        ok: false,
        error: "Meta WhatsApp outbound configuration is incomplete."
      },
      500
    );
  }

  if (provider === "twilio" && !ensureTwilioReady(config)) {
    return jsonResponse(
      {
        ok: false,
        error: "Twilio outbound configuration is incomplete."
      },
      500
    );
  }

  if (!hasAllowedContentType(request, ["application/json"])) {
    return jsonResponse(
      {
        ok: false,
        error: "Unsupported content type."
      },
      415
    );
  }

  const contentLength = getContentLength(request);

  if (contentLength !== null && contentLength > MAX_CALCOM_WEBHOOK_BYTES) {
    return jsonResponse(
      {
        ok: false,
        error: "Payload too large."
      },
      413
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256");

  if (!signature) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing Cal.com signature."
      },
      403
    );
  }

  const isValidSignature = await verifyCalcomSignature(
    rawBody,
    env.CALCOM_WEBHOOK_SECRET,
    signature
  );

  if (!isValidSignature) {
    return jsonResponse(
      {
        ok: false,
        error: "Invalid Cal.com signature."
      },
      403
    );
  }

  let body;

  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    console.error("Invalid Cal.com webhook payload", error);
    return jsonResponse(
      {
        ok: false,
        error: "Invalid JSON payload."
      },
      400
    );
  }

  const triggerEvent = String(body?.triggerEvent || "");

  if (!SUPPORTED_EVENTS.has(triggerEvent)) {
    return jsonResponse({
      ok: true,
      ignored: true,
      triggerEvent
    });
  }

  const providerTemplate =
    provider === "meta"
      ? config.meta.templateNameByEvent[triggerEvent]
      : config.twilio.contentSidByEvent[triggerEvent];

  if (!providerTemplate) {
    console.warn(`Skipping ${triggerEvent}: missing ${provider} template configuration.`);
    return jsonResponse({
      ok: true,
      skipped: true,
      triggerEvent,
      provider,
      reason:
        provider === "meta"
          ? "Missing Meta template name for this event."
          : "Missing Twilio content SID for this event."
    });
  }

  const booking = extractBookingFromCalcom(body, {
    defaultCountryDialCode: config.defaultCountryDialCode,
    defaultBookingUrl: config.bookingUrl,
    timezone: config.timezone
  });

  if (!booking.attendeePhone) {
    console.warn(`Skipping ${triggerEvent}: no attendee phone in Cal.com payload.`);
    return jsonResponse({
      ok: true,
      skipped: true,
      triggerEvent,
      bookingId: booking.bookingId || null,
      reason: "Missing attendee phone number in Cal.com payload."
    });
  }

  try {
    const contentVariables = buildContentVariables(triggerEvent, booking, config);
    const message =
      provider === "meta"
        ? await sendMetaTemplateMessage({
            accessToken: config.meta.accessToken,
            apiVersion: config.meta.apiVersion,
            phoneNumberId: config.meta.phoneNumberId,
            to: booking.attendeePhone.replace(/^\+/, ""),
            templateName: providerTemplate,
            languageCode: config.meta.templateLanguageCode,
            bodyParameters: Object.values(contentVariables)
          })
        : await sendWhatsAppTemplate({
            accountSid: config.twilio.accountSid,
            authToken: config.twilio.authToken,
            whatsappFrom: config.twilio.whatsappFrom,
            messagingServiceSid: config.twilio.messagingServiceSid,
            to: booking.attendeePhone,
            contentSid: providerTemplate,
            contentVariables
          });

    return jsonResponse({
      ok: true,
      provider,
      triggerEvent,
      bookingId: booking.bookingId || null,
      to: maskPhoneNumber(booking.attendeePhone),
      messageSid: message?.messages?.[0]?.id || message?.sid || null
    });
  } catch (error) {
    console.error(`WhatsApp ${provider} send failed`, error);
    return jsonResponse(
      {
        ok: false,
        provider,
        triggerEvent,
        bookingId: booking.bookingId || null,
        error: error.message
      },
      502
    );
  }
};
