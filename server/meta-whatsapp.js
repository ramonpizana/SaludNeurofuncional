import { cleanText, normalizeKeywordText, pickFirstName } from "./formatting.js";

const encoder = new TextEncoder();

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

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function validateMetaSignature({ appSecret, signature, rawBody }) {
  const trimmedSecret = cleanText(appSecret);
  const trimmedSignature = cleanText(signature);

  if (!trimmedSecret || !trimmedSignature || !trimmedSignature.startsWith("sha256=")) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(trimmedSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expected = `sha256=${arrayBufferToHex(digest)}`;

  return timingSafeEqual(expected, trimmedSignature);
}

export function resolveMetaWebhookChallenge(url, verifyToken) {
  const parsedUrl = new URL(url);
  const mode = cleanText(parsedUrl.searchParams.get("hub.mode"));
  const challenge = cleanText(parsedUrl.searchParams.get("hub.challenge"));
  const incomingVerifyToken = cleanText(parsedUrl.searchParams.get("hub.verify_token"));
  const expectedVerifyToken = cleanText(verifyToken);

  if (mode !== "subscribe" || !challenge || !expectedVerifyToken) {
    return null;
  }

  if (incomingVerifyToken !== expectedVerifyToken) {
    return false;
  }

  return challenge;
}

function getChangeValues(payload) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  return entries.flatMap((entry) =>
    Array.isArray(entry?.changes)
      ? entry.changes.map((change) => change?.value).filter(Boolean)
      : []
  );
}

function extractMessageText(message) {
  if (!message || typeof message !== "object") {
    return "";
  }

  if (message.type === "text") {
    return cleanText(message.text?.body);
  }

  if (message.type === "button") {
    return cleanText(message.button?.text);
  }

  if (message.type === "interactive") {
    return (
      cleanText(message.interactive?.button_reply?.title) ||
      cleanText(message.interactive?.list_reply?.title)
    );
  }

  return "";
}

export function extractMetaInboundMessage(payload) {
  for (const value of getChangeValues(payload)) {
    const message = Array.isArray(value?.messages) ? value.messages[0] : null;

    if (!message) {
      continue;
    }

    const profileName = cleanText(value?.contacts?.[0]?.profile?.name);
    const text = extractMessageText(message);

    return {
      from: cleanText(message.from),
      profileName,
      messageId: cleanText(message.id),
      text,
      type: cleanText(message.type)
    };
  }

  return null;
}

async function sendGraphRequest({ accessToken, apiVersion, phoneNumberId, body }) {
  if (!accessToken || !phoneNumberId) {
    throw new Error("Meta WhatsApp credentials are incomplete.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const responseText = await response.text();
  let parsed = null;

  try {
    parsed = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    throw new Error(parsed?.error?.message || responseText || "Meta Graph API request failed.");
  }

  return parsed || { raw: responseText };
}

export async function sendMetaTextMessage({
  accessToken,
  apiVersion,
  phoneNumberId,
  to,
  body
}) {
  return sendGraphRequest({
    accessToken,
    apiVersion,
    phoneNumberId,
    body: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body
      }
    }
  });
}

export async function sendMetaTemplateMessage({
  accessToken,
  apiVersion,
  phoneNumberId,
  to,
  templateName,
  languageCode,
  bodyParameters = []
}) {
  const components = bodyParameters.length
    ? [
        {
          type: "body",
          parameters: bodyParameters.map((value) => ({
            type: "text",
            text: String(value ?? "")
          }))
        }
      ]
    : [];

  return sendGraphRequest({
    accessToken,
    apiVersion,
    phoneNumberId,
    body: {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        ...(components.length ? { components } : {})
      }
    }
  });
}

export function createMetaAutoReply({ incomingText, profileName, config }) {
  const clinicName = config.clinicName || "Salud Neurofuncional";
  const bookingUrl = config.bookingUrl || config.siteUrl;
  const firstName = pickFirstName(profileName);
  const greeting = firstName ? `Hola ${firstName}` : "Hola";
  const message = normalizeKeywordText(String(incomingText || "").slice(0, 500));

  if (!message) {
    return `${greeting}, gracias por escribir a ${clinicName}. Puedes reservar aqui: ${bookingUrl}. Si necesitas ayuda, responde AGENDAR, REAGENDAR o UBICACION.`;
  }

  if (/(reagendar|reprogramar|mover|cambiar)/.test(message)) {
    return `${greeting}, puedes gestionar tu cita desde ${bookingUrl}. Si no encuentras tu horario, responde con tu nombre completo y te apoyamos por este medio.`;
  }

  if (/(ubicacion|direccion|donde)/.test(message)) {
    return `${greeting}, atendemos en ${config.locationLabel}. Si quieres apartar horario, reserva aqui: ${bookingUrl}`;
  }

  if (/(agendar|reservar|cita|valoracion)/.test(message)) {
    return `${greeting}, puedes reservar tu cita aqui: ${bookingUrl}`;
  }

  if (/(precio|costo|cuanto|informes)/.test(message)) {
    return `${greeting}, cuentanos brevemente tu caso y te respondemos por este medio. Si prefieres ir directo a agenda, aqui esta el enlace: ${bookingUrl}`;
  }

  return `${greeting}, gracias por escribir a ${clinicName}. Puedes reservar aqui: ${bookingUrl}. Si necesitas ayuda, responde AGENDAR, REAGENDAR o UBICACION.`;
}
