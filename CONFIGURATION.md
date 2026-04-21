# Configuracion Segura

## Regla principal

No guardes credenciales en el repo, en `site-config.js`, ni en archivos versionados.

## Donde va cada valor

### Cloudflare Pages

Usa `Workers & Pages > saludneurofuncional > Settings > Variables and Secrets`.

Variables:

- `PUBLIC_SITE_URL`
- `CALCOM_BOOKING_URL`
- `CLINIC_NAME`
- `CLINIC_TIMEZONE`
- `CLINIC_LOCATION_LABEL`
- `DEFAULT_COUNTRY_DIAL_CODE`

Secrets:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_MESSAGING_SERVICE_SID`
- `CALCOM_WEBHOOK_SECRET`
- `TWILIO_CONTENT_SID_BOOKING_CREATED`
- `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
- `TWILIO_CONTENT_SID_BOOKING_CANCELLED`

### GitHub

Usa `Settings > Secrets and variables > Actions` solo para automatizaciones de GitHub Actions.

Hoy este repo no necesita en GitHub los secretos de Twilio o Cal.com para producir el sitio, porque la ejecucion ocurre en Cloudflare Pages.

Solo agrega secretos en GitHub si despues automatizas despliegues desde Actions, por ejemplo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Local

Para pruebas locales con `wrangler pages dev`, usa `.dev.vars`.

Pasos:

1. Duplica `.dev.vars.example` a `.dev.vars`.
2. Llena tus valores reales.
3. Nunca hagas commit de `.dev.vars`.

## Donde encontrar cada valor

### Twilio

- `TWILIO_ACCOUNT_SID`: Twilio Console Dashboard.
- `TWILIO_AUTH_TOKEN`: Twilio Console Dashboard.
- `TWILIO_WHATSAPP_FROM`: usa el formato `whatsapp:+<numero>`.
  - Para sandbox: `whatsapp:+14155238886`
  - Para produccion: el numero que hayas dado de alta como WhatsApp Sender
- `TWILIO_MESSAGING_SERVICE_SID`: Twilio Console > Messaging > Services, si eliges enviar por Messaging Service.
- `TWILIO_CONTENT_SID_*`: Twilio Console > Content Template Builder, al crear y aprobar cada plantilla de WhatsApp.
- El boton publico de la landing usa `site-config.js > contact.whatsappNumber`.
  - Si no quieres exponer un numero publico todavia, dejalo vacio y el boton se oculta.
  - No pongas ahi el numero de Twilio hasta confirmar que ya fue activado como WhatsApp Sender.

### Cal.com

- `CALCOM_BOOKING_URL`: tu URL publica de reserva, por ejemplo `https://cal.com/ramon-pizana`.
- `CALCOM_WEBHOOK_SECRET`: lo defines tu al crear el webhook en Cal.com. Debe ser el mismo valor guardado en Cloudflare Pages.

## Numero de Twilio y WhatsApp

Que Twilio te haya dado un numero no significa que ya sea un sender de WhatsApp.

Para usar un numero como `TWILIO_WHATSAPP_FROM`, primero debe estar dado de alta en `Messaging > Senders > WhatsApp Senders`.

Para pruebas rapidas:

- usa el sandbox de WhatsApp de Twilio
- une tu telefono enviando el mensaje `join <codigo>` al numero sandbox

## Como revisar mensajes en pruebas

En Twilio Console:

- `Monitor > Logs > Messaging`: mensajes entrantes y salientes
- `Monitor > Insights > Messaging`: vista agregada y diagnostico

En Cloudflare Pages:

- revisa los logs de Functions para confirmar que llegaron los webhooks de Cal.com y Twilio

## Recomendacion operativa

1. Primero prueba con sandbox de Twilio.
2. Cuando el flujo este bien, registra tu numero real como WhatsApp Sender.
3. Manten las plantillas y secretos solo en Cloudflare Pages.
