import { cleanText } from "../../../server/formatting.js";
import { getRuntimeConfig } from "../../../server/runtime-config.js";

const MAX_MESSAGE_LENGTH = 500;

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function buildRedirectTarget(number, message) {
  const url = new URL(`https://wa.me/${number.replace(/[^\d]/g, "")}`);

  if (message) {
    url.searchParams.set("text", message.slice(0, MAX_MESSAGE_LENGTH));
  }

  return url.toString();
}

export const onRequestGet = async ({ request, env }) => {
  const config = getRuntimeConfig(env);
  const redirectNumber = config.contactGateway.redirectNumber;

  if (!redirectNumber) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing WHATSAPP_REDIRECT_NUMBER in Cloudflare Pages secrets."
      },
      500
    );
  }

  const url = new URL(request.url);
  const message = cleanText(url.searchParams.get("message"));
  const source = cleanText(url.searchParams.get("source"));
  const target = buildRedirectTarget(redirectNumber, message);

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      Location: target,
      ...(source ? { "X-WhatsApp-Source": source } : {})
    }
  });
};
