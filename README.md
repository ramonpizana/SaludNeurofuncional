# SaludNeurofuncional

Landing page base para una fisioterapeuta o terapeuta fisica con:

- Secciones informativas sobre enfoque, servicios, proceso de atencion y preguntas frecuentes.
- Formulario local que abre Google Calendar y genera un respaldo `.ics`.
- Configuracion publica para migrar despues a una agenda externa.
- Base lista para publicar en Cloudflare Pages.
- Webhooks para conectar Cal.com con confirmaciones por WhatsApp usando Twilio o Meta Cloud API.

## Archivos principales

- `index.html`
- `styles.css`
- `script.js`
- `site-config.js`
- `wrangler.jsonc`
- `DEPLOYMENT.md`
- `ARCHITECTURE.md`
- `CONFIGURATION.md`
- `functions/api/webhooks/calcom.js`
- `functions/api/webhooks/twilio/inbound.js`
- `functions/api/webhooks/meta/whatsapp.js`

## Uso rapido

Para ver la landing localmente, abre `index.html` o sirve la carpeta con cualquier servidor estatico.

## Configuracion del sitio

Edita `site-config.js` para personalizar:

- nombre y marca
- direccion o texto del consultorio
- numero de WhatsApp
- preguntas frecuentes y copy de la CTA de contacto
- modo de agenda

Ademas, la FAQ ya soporta acciones rapidas de WhatsApp con mensajes prellenados mediante `faq.ctaActions`.

Modos de agenda soportados:

- `form`: deja el formulario actual y genera evento de Google Calendar en el navegador
- `external`: oculta el formulario y abre una agenda externa como Cal.com o Calendly

## Arquitectura

La base del proyecto ya quedo dividida por responsabilidades:

- frontend modular en `app/`
- estilos por capas en `styles/`
- edge functions en `functions/`
- utilidades seguras para webhooks en `server/`

Referencia rapida:

- [ARCHITECTURE.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/ARCHITECTURE.md)
- [CONFIGURATION.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/CONFIGURATION.md)
- [SECURITY.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/SECURITY.md)

## Como usar Spec Kit en este repo

`spec-kit` ya esta inicializado y se usa asi:

- `.specify/`: plantillas, scripts y memoria del flujo de trabajo
- `.agents/skills/`: skills locales que Codex puede seguir para `specify`, `plan`, `tasks` y flujo git
- `AGENTS.md`: apunta al plan activo que el agente debe leer primero
- `specs/`: aqui viven las features especificadas

En este momento, la feature activa es:

- [specs/002-meta-whatsapp-cloud/spec.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/specs/002-meta-whatsapp-cloud/spec.md)
- [specs/002-meta-whatsapp-cloud/plan.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/specs/002-meta-whatsapp-cloud/plan.md)
- [specs/002-meta-whatsapp-cloud/tasks.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/specs/002-meta-whatsapp-cloud/tasks.md)

Flujo recomendado:

1. Define la mejora en `spec.md`.
2. Baja esa idea a diseno tecnico en `plan.md`.
3. Convierte el trabajo en tareas concretas en `tasks.md`.
4. Implementa y valida con `npm run validate`.
5. Documenta cualquier cambio operativo en README, CONFIGURATION o DEPLOYMENT.

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
- `dist/app/*`
- `dist/styles/*`

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

## Automatizacion con Cal.com + WhatsApp

La integracion actual agrega estos endpoints en Cloudflare Pages Functions:

- `/api/webhooks/calcom`: recibe `BOOKING_CREATED`, `BOOKING_RESCHEDULED` y `BOOKING_CANCELLED` desde Cal.com y dispara WhatsApp por el proveedor configurado.
- `/api/webhooks/twilio/inbound`: responde mensajes entrantes de WhatsApp con respuestas automaticas sencillas.
- `/api/webhooks/meta/whatsapp`: verifica webhook de Meta y responde mensajes entrantes por Cloud API.

Configuracion recomendada:

- Duplica `.dev.vars.example` a `.dev.vars` para pruebas locales con `wrangler pages dev`.
- En Cloudflare Pages agrega como secretos:
  - `META_APP_SECRET`
  - `META_WHATSAPP_ACCESS_TOKEN`
  - `META_WHATSAPP_PHONE_NUMBER_ID`
  - `META_WHATSAPP_VERIFY_TOKEN`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_FROM` o `TWILIO_MESSAGING_SERVICE_SID`
  - `CALCOM_WEBHOOK_SECRET`
  - `TWILIO_CONTENT_SID_BOOKING_CREATED`
  - `TWILIO_CONTENT_SID_BOOKING_RESCHEDULED`
  - `TWILIO_CONTENT_SID_BOOKING_CANCELLED`
  - `META_TEMPLATE_BOOKING_CREATED`
  - `META_TEMPLATE_BOOKING_RESCHEDULED`
  - `META_TEMPLATE_BOOKING_CANCELLED`
- En Cloudflare Pages agrega como variables:
  - `WHATSAPP_PROVIDER`
  - `PUBLIC_SITE_URL`
  - `CALCOM_BOOKING_URL`
  - `CLINIC_NAME`
  - `CLINIC_TIMEZONE`
  - `CLINIC_LOCATION_LABEL`
  - `DEFAULT_COUNTRY_DIAL_CODE`
  - `META_WHATSAPP_API_VERSION`
  - `META_TEMPLATE_LANGUAGE_CODE`

Puntos importantes:

- En Cal.com el evento debe pedir telefono del paciente. Sin telefono, el webhook se omite para no enviar a un destino incorrecto.
- Las confirmaciones salientes de WhatsApp usan plantillas aprobadas de Twilio Content Template Builder.
- Las respuestas entrantes de Twilio se contestan con TwiML, sin exponer credenciales en el cliente.
- Si usas `WHATSAPP_PROVIDER=meta`, las confirmaciones de Cal.com salen por Meta Cloud API y el webhook entrante va por `/api/webhooks/meta/whatsapp`.
- La guia paso a paso de donde encontrar cada valor esta en [CONFIGURATION.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/CONFIGURATION.md).

## Meta Cloud API: que conviene hacer

No necesitas instalar el sample repo de Meta para este proyecto. Ese repo esta pensado como una app Node separada con `.env`, webhook propio y server dedicado. Aqui es mas practico:

- dejar la landing y agenda en este mismo repo
- usar Cloudflare Pages Functions para el webhook de Meta
- guardar access token, verify token y app secret en Cloudflare Pages
- activar `WHATSAPP_PROVIDER=meta` cuando quieras que Cal.com notifique por Meta en vez de Twilio

Callback URL para Meta:

```text
https://saludneurofuncional.pages.dev/api/webhooks/meta/whatsapp
```

Verification token:

- lo inventas tu
- debe coincidir exactamente con `META_WHATSAPP_VERIFY_TOKEN`

Si ya te funciono el `hello_world`, entonces la siguiente configuracion real es:

1. guardar `META_WHATSAPP_ACCESS_TOKEN` en Cloudflare Pages
2. guardar `META_WHATSAPP_PHONE_NUMBER_ID` en Cloudflare Pages
3. guardar `META_APP_SECRET` en Cloudflare Pages
4. guardar `META_WHATSAPP_VERIFY_TOKEN` en Cloudflare Pages
5. poner `WHATSAPP_PROVIDER=meta`
6. verificar el webhook en Meta y suscribirte al campo `messages`

## Camino simple para WhatsApp

Si no quieres pagar API todavia, el camino mas simple es:

- dejar `contact.whatsappNumber` con tu numero publico
- usar los mensajes prellenados del sitio
- operar respuestas automaticas basicas desde WhatsApp Business App con Greeting, Away Messages y Quick Replies

Eso no reemplaza un bot real, pero si te da una experiencia mucho mejor sin agregar secretos ni costos iniciales.

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

Ademas, usa el template de PR y evita mergear cambios de UI sin:

- `npm run validate`
- revision visual en desktop y mobile
- confirmacion de que no se agregaron secretos ni datos sensibles

Si tu proyecto de Cloudflare Pages esta conectado a este repositorio y `main`
es la rama de produccion, un PR aprobado y mergeado a `main` dispara el
despliegue automaticamente. Si no existe esa conexion, sigue el flujo manual de
`DEPLOYMENT.md`.

## Siguiente paso recomendado

1. Publicar la landing en Cloudflare Pages.
2. Mantener `site-config.js` con el enlace real de Cal.com.
3. Configurar secretos y webhooks para Twilio y Cal.com.
4. Probar una reserva real y una respuesta entrante de WhatsApp.
