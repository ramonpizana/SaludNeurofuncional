# Deployment Guide

## Objetivo

Publicar la landing en Cloudflare Pages y dejar activa la automatizacion con Cal.com + Twilio para confirmaciones por WhatsApp y respuestas entrantes.

## Lo que ya deja listo este repo

- Build estatico en `dist/`.
- Configuracion de Cloudflare Pages en `wrangler.jsonc`.
- Endpoint de salud en `/api/health`.
- Webhook de Cal.com en `/api/webhooks/calcom`.
- Webhook de Twilio entrante en `/api/webhooks/twilio/inbound`.
- Configuracion publica editable en `site-config.js`.
- Variables locales de ejemplo en `.dev.vars.example`.

## Publicar en Cloudflare Pages

1. Inicia sesion en Cloudflare:

```bash
npx wrangler login
```

2. Crea el proyecto de Pages:

```bash
npx wrangler pages project create salud-neurofuncional --production-branch main
```

3. Genera el build estatico:

```bash
npm run build
```

4. Despliega el sitio:

```bash
npx wrangler pages deploy dist
```

5. Verifica:

- `https://saludneurofuncional.pages.dev/`
- `https://saludneurofuncional.pages.dev/api/health`
- `https://saludneurofuncional.pages.dev/api/webhooks/calcom`
- `https://saludneurofuncional.pages.dev/api/webhooks/twilio/inbound`

## Variables y secretos en Cloudflare Pages

En `Workers & Pages > tu proyecto > Settings > Variables and Secrets`, agrega:

Variables:

- `PUBLIC_SITE_URL=https://saludneurofuncional.pages.dev`
- `CALCOM_BOOKING_URL=https://cal.com/ramon-pizana`
- `CLINIC_NAME=Salud Neurofuncional`
- `CLINIC_TIMEZONE=America/Mexico_City`
- `CLINIC_LOCATION_LABEL=Consultorio Salud Neurofuncional`
- `DEFAULT_COUNTRY_DIAL_CODE=+52`

Secretos:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM` o `TWILIO_MESSAGING_SERVICE_SID`
- `CALCOM_WEBHOOK_SECRET`
- `TWILIO_CONTENT_SID_BOOKING_CREATED`
- `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
- `TWILIO_CONTENT_SID_BOOKING_CANCELLED`

## Configurar Cal.com

1. En tu evento de Cal.com, confirma que el formulario pida telefono del paciente.
2. Crea un webhook apuntando a:

```text
https://saludneurofuncional.pages.dev/api/webhooks/calcom
```

3. Activa estos eventos:

- `BOOKING_CREATED`
- `BOOKING_RESCHEDULED`
- `BOOKING_CANCELLED`

4. Usa el mismo secreto que guardaste en `CALCOM_WEBHOOK_SECRET`.

## Configurar Twilio WhatsApp

1. En Twilio, usa tu WhatsApp sender aprobado o el sandbox.
2. Configura el webhook entrante con metodo `POST` a:

```text
https://saludneurofuncional.pages.dev/api/webhooks/twilio/inbound
```

3. Crea plantillas aprobadas en Twilio Content Template Builder.

Plantilla sugerida para `BOOKING_CREATED` y `BOOKING_RESCHEDULED`:

```text
Hola {{1}}, tu cita en {{2}} quedo programada para el {{3}} a las {{4}}. Puedes gestionarla aqui: {{5}}
```

Plantilla sugerida para `BOOKING_CANCELLED`:

```text
Hola {{1}}, tu cita en {{2}} fue cancelada. Si quieres agendar de nuevo, hazlo aqui: {{3}}
```

4. Copia los `ContentSid` (`HX...`) en:

- `TWILIO_CONTENT_SID_BOOKING_CREATED`
- `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
- `TWILIO_CONTENT_SID_BOOKING_CANCELLED`

## Pruebas recomendadas

1. Abre `https://saludneurofuncional.pages.dev`.
2. Reserva una cita real desde `https://cal.com/ramon-pizana`.
3. Confirma en los logs de Pages que `/api/webhooks/calcom` devolvio `ok: true`.
4. Revisa que llegue el WhatsApp de confirmacion.
5. Escribe por WhatsApp `hola`, `agendar`, `reagendar` y `ubicacion` para probar el flujo entrante.

## Local

Para pruebas locales con Functions:

1. Copia `.dev.vars.example` a `.dev.vars`.
2. Llena tus secretos.
3. Ejecuta:

```bash
npm run preview:cloudflare
```

## Flujo recomendado siguiente

1. Tener el deploy estable en `pages.dev`.
2. Probar confirmaciones y cancelaciones desde Cal.com.
3. Afinar los textos de plantillas y respuestas entrantes.
4. Si mas adelante quieres recordatorios o historial, agregar D1 para deduplicacion y trazabilidad.
