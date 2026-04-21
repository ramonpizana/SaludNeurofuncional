# Arquitectura del Proyecto

## Objetivo

Mantener la landing, la automatizacion con webhooks y la configuracion operativa separadas por responsabilidad para evitar codigo espagueti.

## Estructura

- `index.html`: estructura principal del sitio.
- `site-config.js`: configuracion publica editable de marca, enlaces y modo de agenda.
- `script.js`: punto de entrada del frontend.
- `styles.css`: punto de entrada de estilos.
- `app/`: modulos del frontend.
- `styles/`: estilos separados por capas.
- `functions/`: endpoints expuestos por Cloudflare Pages Functions.
- `server/`: utilidades compartidas para webhooks, firmas y configuracion segura.
- `scripts/`: build y validaciones del repo.

## Frontend

`app/` esta separado por funcion:

- `config.js`: normaliza la configuracion publica.
- `dom.js`: centraliza referencias del DOM.
- `utils/`: utilidades puras para calendario y WhatsApp.
- `features/`: comportamiento por area, como branding, booking mode y formulario.
- `main.js`: orquestacion de inicializacion.

`styles/` esta separado por capas:

- `tokens.css`: variables de diseno.
- `base.css`: reset y reglas globales.
- `layout.css`: estructura general.
- `components.css`: botones, tarjetas y elementos reutilizables.
- `sections.css`: hero, servicios, agenda y secciones.
- `responsive.css`: ajustes responsivos.

## Backend Edge

- `functions/api/health.ts`: health check.
- `functions/api/webhooks/calcom.js`: recibe eventos de Cal.com.
- `functions/api/webhooks/twilio/inbound.js`: responde mensajes entrantes de WhatsApp.
- `server/*.js`: logica reutilizable para firma, Twilio, Cal.com y runtime config.

## Regla de mantenimiento

Antes de agregar una nueva funcion:

1. Si es solo presentacion, va en `styles/`.
2. Si es comportamiento del navegador, va en `app/features/` o `app/utils/`.
3. Si toca secretos, firmas o APIs sensibles, va en `server/` y `functions/`.
4. Si cambia despliegue o validacion, va en `scripts/` o documentacion.
