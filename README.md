# SaludNeurofuncional

Landing page base para una fisioterapeuta o terapeuta fisica con:

- Secciones informativas sobre enfoque, servicios y proceso de atencion.
- Formulario local que abre Google Calendar y genera un respaldo `.ics`.
- Configuracion publica para migrar despues a una agenda externa.
- Base lista para publicar en Cloudflare Pages.
- Webhooks para conectar Cal.com con confirmaciones por WhatsApp en Twilio.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`
- `site-config.js`
- `wrangler.jsonc`
- `DEPLOYMENT.md`
- `functions/api/webhooks/calcom.js`
- `functions/api/webhooks/twilio/inbound.js`

## Uso rapido

Para ver la landing localmente, abre `index.html` o sirve la carpeta con cualquier servidor estatico.

## Configuracion del sitio

Edita `site-config.js` para personalizar:

- nombre y marca
- direccion o texto del consultorio
- numero de WhatsApp
- modo de agenda

Modos de agenda soportados:

- `form`: deja el formulario actual y genera evento de Google Calendar en el navegador
- `external`: oculta el formulario y abre una agenda externa como Cal.com o Calendly

## Build para Cloudflare Pages

Genera la carpeta lista para desplegar:

```bash
npm run build
```

Salida:

- `dist/index.html`
- `dist/styles.css`
- `dist/script.js`
- `dist/site-config.js`
- `dist/_headers`

## Publicacion

El flujo recomendado de despliegue esta en [DEPLOYMENT.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/DEPLOYMENT.md).

Resumen corto:

```bash
npx wrangler login
npx wrangler pages project create salud-neurofuncional --production-branch main
npm run build
npx wrangler pages deploy dist
```

## Validacion local

Con Node 20 o superior:

```bash
node scripts/validate-repo.mjs
```

O con:

```bash
npm run validate
```

La validacion ahora tambien confirma que el build a `dist/` funcione.

## Automatizacion con Cal.com + Twilio

La integracion actual agrega dos endpoints en Cloudflare Pages Functions:

- `/api/webhooks/calcom`: recibe `BOOKING_CREATED`, `BOOKING_RESCHEDULED` y `BOOKING_CANCELLED` desde Cal.com y dispara WhatsApp por Twilio.
- `/api/webhooks/twilio/inbound`: responde mensajes entrantes de WhatsApp con respuestas automaticas sencillas.

Configuracion recomendada:

- Duplica `.dev.vars.example` a `.dev.vars` para pruebas locales con `wrangler pages dev`.
- En Cloudflare Pages agrega como secretos:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_FROM` o `TWILIO_MESSAGING_SERVICE_SID`
  - `CALCOM_WEBHOOK_SECRET`
  - `TWILIO_CONTENT_SID_BOOKING_CREATED`
  - `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
  - `TWILIO_CONTENT_SID_BOOKING_CANCELLED`
- En Cloudflare Pages agrega como variables:
  - `PUBLIC_SITE_URL`
  - `CALCOM_BOOKING_URL`
  - `CLINIC_NAME`
  - `CLINIC_TIMEZONE`
  - `CLINIC_LOCATION_LABEL`
  - `DEFAULT_COUNTRY_DIAL_CODE`

Puntos importantes:

- En Cal.com el evento debe pedir telefono del paciente. Sin telefono, el webhook se omite para no enviar a un destino incorrecto.
- Las confirmaciones salientes de WhatsApp usan plantillas aprobadas de Twilio Content Template Builder.
- Las respuestas entrantes se contestan con TwiML, sin exponer credenciales en el cliente.

## Automatizacion en GitHub

Se agregaron workflows en `.github/workflows/` para:

- Validar estructura del repo y build local.
- Escanear secretos con Gitleaks.
- Ejecutar CodeQL sobre JavaScript y workflows.

Si quieres bloquear merges a `main`, marca como requeridos:

- `Repository Validation`
- `Secret Scan`
- `CodeQL / Analyze (javascript-typescript)`
- `CodeQL / Analyze (actions)`

## Siguiente paso recomendado

1. Publicar la landing en Cloudflare Pages.
2. Mantener `site-config.js` con el enlace real de Cal.com.
3. Configurar secretos y webhooks para Twilio y Cal.com.
4. Probar una reserva real y una respuesta entrante de WhatsApp.
