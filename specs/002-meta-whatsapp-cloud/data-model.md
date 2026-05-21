# Data Model: Meta WhatsApp Cloud API + Security

## Entities

### WhatsApp Provider Config

- `provider`: `twilio` or `meta`
- `accessToken`: secret, server-only
- `phoneNumberId`: server-only operational identifier
- `verifyToken`: secret string for webhook challenge
- `appSecret`: secret used to validate `x-hub-signature-256`
- `templateNameByEvent`: mapping by booking event
- `templateLanguageCode`: template locale

### Meta Webhook Challenge

- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

### Meta Inbound Message

- `from`
- `profileName`
- `messageId`
- `type`
- `text`

### Booking Notification Dispatch

- `triggerEvent`
- `attendeePhone`
- `attendeeName`
- `dateLabel`
- `timeLabel`
- `managementUrl`
- `provider`
- `templateName` or `contentSid`
