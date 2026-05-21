import {
  cleanText,
  escapeXml,
  normalizeKeywordText,
  pickFirstName
} from "./formatting.js";

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

function arrayBufferToBase64(buffer) {
  let binary = "";

  for (const value of new Uint8Array(buffer)) {
    binary += String.fromCharCode(value);
  }

  return btoa(binary);
}

function buildSignaturePayload(url, formData) {
  const grouped = new Map();

  for (const [key, rawValue] of formData.entries()) {
    const values = grouped.get(key) || [];
    values.push(String(rawValue));
    grouped.set(key, values);
  }

  let payload = url;

  for (const key of [...grouped.keys()].sort()) {
    const values = grouped.get(key).sort();

    for (const value of values) {
      payload += `${key}${value}`;
    }
  }

  return payload;
}

export async function validateTwilioSignature({ authToken, signature, url, formData }) {
  const trimmedSignature = cleanText(signature);

  if (!authToken || !trimmedSignature) {
    return false;
  }

  const payload = buildSignaturePayload(url, formData);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedSignature = arrayBufferToBase64(digest);

  return timingSafeEqual(expectedSignature, trimmedSignature);
}

export async function sendWhatsAppTemplate({
  accountSid,
  authToken,
  whatsappFrom,
  messagingServiceSid,
  to,
  contentSid,
  contentVariables
}) {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are incomplete.");
  }

  if (!contentSid) {
    throw new Error("Missing Twilio ContentSid for this event.");
  }

  if (!messagingServiceSid && !whatsappFrom) {
    throw new Error("Missing Twilio WhatsApp sender configuration.");
  }

  const body = new URLSearchParams();
  body.set("To", to.startsWith("whatsapp:") ? to : `whatsapp:${to}`);
  body.set("ContentSid", contentSid);

  if (messagingServiceSid) {
    body.set("MessagingServiceSid", messagingServiceSid);
  } else {
    body.set("From", whatsappFrom);
  }

  if (contentVariables && Object.keys(contentVariables).length > 0) {
    body.set("ContentVariables", JSON.stringify(contentVariables));
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );

  const responseText = await response.text();
  let parsedBody = null;

  try {
    parsedBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new Error(parsedBody?.message || responseText || "Twilio API request failed.");
  }

  return parsedBody || { raw: responseText };
}

export function buildMessagingResponse(messageText = "") {
  const messageNode = messageText
    ? `<Message>${escapeXml(messageText)}</Message>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?><Response>${messageNode}</Response>`;
}

export function createAutoReply({ incomingText, profileName, config }) {
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
