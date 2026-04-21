import { extractBookingFromCalcom, verifyCalcomSignature } from "../../../server/calcom.js";
import { maskPhoneNumber } from "../../../server/formatting.js";
import { getRuntimeConfig } from "../../../server/runtime-config.js";
import { sendWhatsAppTemplate } from "../../../server/twilio.js";

const SUPPORTED_EVENTS = new Set([
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED"
]);

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function ensureTwilioReady(config) {
  return Boolean(
    config.twilio.accountSid &&
      config.twilio.authToken &&
      (config.twilio.whatsappFrom || config.twilio.messagingServiceSid)
  );
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

  return jsonResponse({
    ok: true,
    endpoint: "calcom-webhook",
    supportedEvents: [...SUPPORTED_EVENTS],
    twilioReady: ensureTwilioReady(config),
    templates: Object.fromEntries(
      [...SUPPORTED_EVENTS].map((eventName) => [eventName, Boolean(config.twilio.contentSidByEvent[eventName])])
    ),
    requiresPhoneCollection: true
  });
};

export const onRequestPost = async ({ request, env }) => {
  const config = getRuntimeConfig(env);

  if (!env.CALCOM_WEBHOOK_SECRET) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing CALCOM_WEBHOOK_SECRET in Cloudflare Pages secrets."
      },
      500
    );
  }

  if (!ensureTwilioReady(config)) {
    return jsonResponse(
      {
        ok: false,
        error: "Twilio outbound configuration is incomplete."
      },
      500
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256");
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

  const contentSid = config.twilio.contentSidByEvent[triggerEvent];

  if (!contentSid) {
    console.warn(`Skipping ${triggerEvent}: missing Twilio content SID.`);
    return jsonResponse({
      ok: true,
      skipped: true,
      triggerEvent,
      reason: "Missing Twilio content SID for this event."
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
    const message = await sendWhatsAppTemplate({
      accountSid: config.twilio.accountSid,
      authToken: config.twilio.authToken,
      whatsappFrom: config.twilio.whatsappFrom,
      messagingServiceSid: config.twilio.messagingServiceSid,
      to: booking.attendeePhone,
      contentSid,
      contentVariables: buildContentVariables(triggerEvent, booking, config)
    });

    return jsonResponse({
      ok: true,
      triggerEvent,
      bookingId: booking.bookingId || null,
      to: maskPhoneNumber(booking.attendeePhone),
      messageSid: message?.sid || null
    });
  } catch (error) {
    console.error("Twilio send failed", error);
    return jsonResponse(
      {
        ok: false,
        triggerEvent,
        bookingId: booking.bookingId || null,
        error: error.message
      },
      502
    );
  }
};
