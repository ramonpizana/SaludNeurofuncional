import { getRuntimeConfig } from "../../../../server/runtime-config.js";
import {
  buildMessagingResponse,
  createAutoReply,
  validateTwilioSignature
} from "../../../../server/twilio.js";

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

  const formData = await request.formData();
  const signature =
    request.headers.get("x-twilio-signature") || request.headers.get("X-Twilio-Signature");
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
