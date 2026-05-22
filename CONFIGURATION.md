# Configuracion Segura

## Regla principal

No guardes credenciales en el repo, en `site-config.js`, ni en archivos versionados.

## Donde va cada valor

### Cloudflare Pages

Usa `Workers & Pages > saludneurofuncional > Settings > Variables and Secrets`.

Variables:

- `WHATSAPP_PROVIDER`
- `PUBLIC_SITE_URL`
- `CALCOM_BOOKING_URL`
- `CLINIC_NAME`
- `CLINIC_TIMEZONE`
- `CLINIC_LOCATION_LABEL`
- `DEFAULT_COUNTRY_DIAL_CODE`
- `META_WHATSAPP_API_VERSION`
- `META_TEMPLATE_LANGUAGE_CODE`

Secrets:

- `WHATSAPP_REDIRECT_NUMBER`
- `META_APP_SECRET`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_VERIFY_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_MESSAGING_SERVICE_SID`
- `CALCOM_WEBHOOK_SECRET`
- `TWILIO_CONTENT_SID_BOOKING_CREATED`
- `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
- `TWILIO_CONTENT_SID_BOOKING_CANCELLED`
- `META_TEMPLATE_BOOKING_CREATED`
- `META_TEMPLATE_BOOKING_RESCHEDULED`
- `META_TEMPLATE_BOOKING_CANCELLED`

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

### Gateway de contacto del sitio

- `WHATSAPP_REDIRECT_NUMBER`: el numero real al que quieres redirigir el boton publico del sitio.
  - Usa formato internacional, por ejemplo `+523311392354`.
  - Este valor vive solo en Cloudflare Pages.
  - El frontend puede usar `/api/contact/whatsapp` sin escribir el numero en `site-config.js`.

Importante:

- esto evita dejar el numero duro en el HTML y en el repositorio
- no vuelve el numero "secreto" a nivel de red, porque el navegador termina abriendo WhatsApp
- si quieres ocultarlo de verdad incluso al destino final, entonces no debes usar click-to-chat; en ese caso necesitas un formulario y que tu backend inicie el contacto por API con consentimiento del usuario

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

### Meta WhatsApp Cloud API

- `META_APP_SECRET`: Meta App > Settings > Basic > App Secret.
- `META_WHATSAPP_ACCESS_TOKEN`: guarda aqui tu token de acceso; mejor si es permanente o de system user.
- `META_WHATSAPP_PHONE_NUMBER_ID`: es el identificador del numero que aparece en tu `curl` para enviar mensajes.
- `META_WHATSAPP_BUSINESS_ACCOUNT_ID`: opcional para referencia operativa; no es necesario para el flujo actual del webhook.
- `META_WHATSAPP_VERIFY_TOKEN`: lo inventas tu. Debe coincidir con el token escrito al verificar el webhook en Meta.
- `META_WHATSAPP_API_VERSION`: por ejemplo `v25.0`.
- `META_TEMPLATE_LANGUAGE_CODE`: por ejemplo `en_US` si sigues usando plantillas de prueba en ingles.
- `META_TEMPLATE_BOOKING_CREATED`: nombre de la plantilla aprobada para confirmacion.
- `META_TEMPLATE_BOOKING_RESCHEDULED`: nombre de la plantilla aprobada para reprogramacion.
- `META_TEMPLATE_BOOKING_CANCELLED`: nombre de la plantilla aprobada para cancelacion.

### Provider activo

- `WHATSAPP_PROVIDER=twilio`: mantiene el flujo actual por Twilio.
- `WHATSAPP_PROVIDER=meta`: usa Meta Cloud API directo para mensajes de agenda desde Cal.com.

## Que identificador de Meta si necesitas

De los identificadores que sueles ver en Meta:

- `Phone Number ID`: si lo usamos y va en `META_WHATSAPP_PHONE_NUMBER_ID`.
- `App ID`: no hace falta guardarlo para el runtime del sitio.
- `Business ID` o `WABA ID`: no hace falta para el flujo actual, salvo referencia operativa.

### Cal.com

- `CALCOM_BOOKING_URL`: tu URL publica de reserva, por ejemplo `https://cal.com/ramon-pizana`.
- `CALCOM_WEBHOOK_SECRET`: lo defines tu al crear el webhook en Cal.com. Debe ser el mismo valor guardado en Cloudflare Pages.

## Contenido FAQ en `site-config.js`

La landing ahora acepta un bloque publico `faq` dentro de `site-config.js`.

Campos recomendados:

- `eyebrow`
- `title`
- `intro`
- `ctaKicker`
- `ctaTitle`
- `ctaHelper`
- `ctaLabel`
- `ctaMessage`
- `ctaActions`
- `items`

Cada elemento de `items` debe incluir:

- `id`
- `question`
- `answer`

Reglas:

- Todo el contenido FAQ debe ser seguro para exponer publicamente.
- Si usas `contact.whatsappMode = "redirect"`, define `contact.whatsappRedirectPath`, por ejemplo `/api/contact/whatsapp`.
- Si usas `contact.whatsappMode = "direct"`, deja `contact.whatsappNumber` con el numero publico.
- Usa `ctaMessage` solo para texto publico de precontacto; nunca pongas datos sensibles, tokens o informacion clinica privada.
- `ctaActions` permite crear botones de acceso rapido con mensajes prellenados, por ejemplo para agendar, pedir ubicacion o resolver dudas sobre costos.

## WhatsApp gratis y seguro

Si quieres algo practico sin costo de API:

- usa `contact.whatsappMode = "redirect"` y el endpoint `/api/contact/whatsapp`
- personaliza `contact.whatsappDefaultMessage` para el mensaje base
- usa `faq.ctaActions` para dar varias opciones guiadas sin meter backend
- en tu telefono, activa en WhatsApp Business las funciones de Greeting, Away Messages y Quick Replies

Eso no es un bot completo, pero si te da:

- contacto directo
- mensajes predeterminados
- respuestas rapidas manuales o semiautomaticas
- cero secretos en el frontend

Si despues quieres un bot real con webhooks y automatizacion, entonces pasas a Meta Cloud API o Twilio.

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

## Configurar webhook de Meta

Callback URL:

```text
https://saludneurofuncional.pages.dev/api/webhooks/meta/whatsapp
```

Verification token:

```text
META_WHATSAPP_VERIFY_TOKEN
```

Pasos:

1. En Meta Developers abre tu app.
2. Ve a `WhatsApp > Configuration`.
3. Pega el callback URL anterior.
4. En verify token pega exactamente el valor de `META_WHATSAPP_VERIFY_TOKEN`.
5. Verifica el webhook.
6. Suscribete al campo `messages`.
