import {
  createMetaAutoReply,
  extractMetaInboundMessage,
  resolveMetaWebhookChallenge,
  sendMetaTextMessage,
  validateMetaSignature
} from "../../../../server/meta-whatsapp.js";
import { getContentLength, hasAllowedContentType } from "../../../../server/request-guards.js";
import { getRuntimeConfig } from "../../../../server/runtime-config.js";

const MAX_META_WEBHOOK_BYTES = 256 * 1024;

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export const onRequestGet = async ({ request, env }) => {
  const config = getRuntimeConfig(env);
  const challenge = resolveMetaWebhookChallenge(request.url, config.meta.verifyToken);

  if (challenge === false) {
    return new Response("Forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  if (typeof challenge === "string" && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=UTF-8"
      }
    });
  }

  return jsonResponse({
    ok: true,
    endpoint: "meta-whatsapp-webhook",
    verifyTokenConfigured: Boolean(config.meta.verifyToken)
  });
};

export const onRequestPost = async ({ request, env }) => {
  const config = getRuntimeConfig(env);

  if (!config.meta.accessToken || !config.meta.phoneNumberId) {
    return jsonResponse(
      {
        ok: false,
        error: "Meta WhatsApp outbound configuration is incomplete."
      },
      500
    );
  }

  if (!config.meta.appSecret) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing META_APP_SECRET in Cloudflare Pages secrets."
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

  if (contentLength !== null && contentLength > MAX_META_WEBHOOK_BYTES) {
    return jsonResponse(
      {
        ok: false,
        error: "Payload too large."
      },
      413
    );
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-hub-signature-256") || request.headers.get("X-Hub-Signature-256");

  if (!signature) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing Meta signature."
      },
      403
    );
  }

  const isValidSignature = await validateMetaSignature({
    appSecret: config.meta.appSecret,
    signature,
    rawBody
  });

  if (!isValidSignature) {
    return jsonResponse(
      {
        ok: false,
        error: "Invalid Meta signature."
      },
      403
    );
  }

  let body;

  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    console.error("Invalid Meta webhook payload", error);
    return jsonResponse(
      {
        ok: false,
        error: "Invalid JSON payload."
      },
      400
    );
  }

  const inbound = extractMetaInboundMessage(body);

  if (!inbound?.from) {
    return jsonResponse({
      ok: true,
      ignored: true,
      reason: "No inbound message payload to process."
    });
  }

  const reply = createMetaAutoReply({
    incomingText: inbound.text,
    profileName: inbound.profileName,
    config
  });

  try {
    const message = await sendMetaTextMessage({
      accessToken: config.meta.accessToken,
      apiVersion: config.meta.apiVersion,
      phoneNumberId: config.meta.phoneNumberId,
      to: inbound.from,
      body: reply
    });

    return jsonResponse({
      ok: true,
      replySent: true,
      to: inbound.from,
      messageId: inbound.messageId || null,
      outboundMessageId: message?.messages?.[0]?.id || null
    });
  } catch (error) {
    console.error("Meta outbound reply failed", error);
    return jsonResponse(
      {
        ok: false,
        error: error.message
      },
      502
    );
  }
};
