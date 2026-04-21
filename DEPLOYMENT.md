# Deployment Guide

## Objetivo

Publicar la landing en Cloudflare Pages para que el sitio quede accesible por internet y preparar el proyecto para conectar una agenda externa y WhatsApp oficial.

## Lo que ya deja listo este repo

- Build estatico en `dist/`.
- Configuracion de Cloudflare Pages en `wrangler.jsonc`.
- Endpoint de salud en `/api/health`.
- Configuracion publica editable en `site-config.js`.
- Encabezados de seguridad en `_headers`.

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

5. Verifica el endpoint:

```bash
https://<tu-proyecto>.pages.dev/api/health
```

## Dominio y SSL

- Para dominio apex como `tudominio.com`, apunta los nameservers a Cloudflare y luego agrega el dominio al proyecto de Pages.
- Para subdominio como `www.tudominio.com`, puedes crear un CNAME hacia `<tu-proyecto>.pages.dev`.
- Cloudflare emite y renueva SSL automaticamente cuando el dominio queda activo.

## Configurar agenda externa

Cuando tengas Cal.com o un sistema similar:

1. Edita `site-config.js`.
2. Cambia `booking.mode` a `"external"`.
3. Agrega la URL en `booking.externalUrl`.
4. Vuelve a ejecutar:

```bash
npm run build
npx wrangler pages deploy dist
```

## Integracion futura con WhatsApp oficial

La recomendacion es usar Twilio WhatsApp o Meta Cloud API.

Secretos esperados para el siguiente paso:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `BOOKING_WEBHOOK_SECRET`
- `TURNSTILE_SECRET_KEY`

En Cloudflare Pages los secretos se cargan con:

```bash
npx wrangler pages secret put TWILIO_ACCOUNT_SID
```

## Flujo recomendado siguiente

1. Publicar la landing.
2. Conectar una agenda externa real.
3. Recibir webhooks de reservas.
4. Enviar confirmaciones y recordatorios por WhatsApp.
