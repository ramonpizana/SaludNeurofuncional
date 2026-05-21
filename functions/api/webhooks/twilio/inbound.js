import { getRuntimeConfig } from "../../../../server/runtime-config.js";
import { getContentLength, hasAllowedContentType } from "../../../../server/request-guards.js";
import {
  buildMessagingResponse,
  createAutoReply,
  validateTwilioSignature
} from "../../../../server/twilio.js";

const MAX_TWILIO_WEBHOOK_BYTES = 64 * 1024;

export const onRequestGet = async () => {
  return Response.json(
    {
      ok: true,
      endpoint: "twilio-whatsapp-inbound"
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};

export const onRequestPost = async ({ request, env }) => {
  const config = getRuntimeConfig(env);

  if (!config.twilio.authToken) {
    return new Response("Missing TWILIO_AUTH_TOKEN.", {
      status: 500
    });
  }

  if (!hasAllowedContentType(request, ["application/x-www-form-urlencoded", "multipart/form-data"])) {
    return new Response("Unsupported Media Type", {
      status: 415
    });
  }

  const contentLength = getContentLength(request);

  if (contentLength !== null && contentLength > MAX_TWILIO_WEBHOOK_BYTES) {
    return new Response("Payload Too Large", {
      status: 413
    });
  }

  const formData = await request.formData();
  const signature =
    request.headers.get("x-twilio-signature") || request.headers.get("X-Twilio-Signature");

  if (!signature) {
    return new Response("Forbidden", {
      status: 403
    });
  }

  const isValidSignature = await validateTwilioSignature({
    authToken: config.twilio.authToken,
    signature,
    url: request.url,
    formData
  });

  if (!isValidSignature) {
    return new Response("Forbidden", {
      status: 403
    });
  }

  const incomingText = String(formData.get("Body") || "");
  const profileName = String(formData.get("ProfileName") || "");
  const reply = createAutoReply({
    incomingText,
    profileName,
    config
  });

  return new Response(buildMessagingResponse(reply), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/xml; charset=UTF-8"
    }
  });
};
