# Seguridad Operativa

## Superficie real del proyecto

Hoy el sitio expone principalmente:

- una landing estatica publicada en Cloudflare Pages
- un health check en `/api/health`
- un webhook de Cal.com en `/api/webhooks/calcom`
- un webhook de Twilio en `/api/webhooks/twilio/inbound`
- un webhook de Meta en `/api/webhooks/meta/whatsapp`

No existe hoy un endpoint publico con LLM ni una consola administrativa expuesta.

## Protecciones ya aplicadas

- secretos fuera del repo y fuera de `site-config.js`
- firma de Cal.com validada antes de procesar eventos
- firma de Twilio validada antes de contestar mensajes
- firma `x-hub-signature-256` de Meta validada antes de procesar eventos
- headers de seguridad en `_headers`
- escaneo de secretos y CodeQL en GitHub Actions
- validacion de `content-type` y `content-length` en webhooks
- respuestas automaticas basadas en reglas, no en prompts generativos

## Prompt injection: que aplica y que no

Hoy `prompt injection` no es el riesgo principal porque el sitio no expone un modelo de IA al publico.

Si mas adelante agregas:

- un bot con n8n + OpenAI
- un asistente en WhatsApp conectado a LLM
- un panel que procese texto libre con herramientas

entonces si necesitas defensas adicionales:

- no dar acceso directo del modelo a secretos
- separar instrucciones del sistema y contenido del usuario
- limitar herramientas disponibles por flujo
- validar y registrar llamadas a herramientas
- agregar rate limiting y handoff humano

## Recomendaciones de Cloudflare

En Cloudflare habilita como minimo:

1. Managed Rules en WAF.
2. Una regla de rate limiting para `/api/health`.
3. Observabilidad de Functions para detectar 403, 413, 415 y 429.

Para los webhooks de Twilio y Cal.com, la defensa principal debe seguir siendo la validacion de firma. Si agregas rate limiting sobre esos endpoints, primero observa trafico real para no bloquear eventos legitimos del proveedor.

## Cuando usar Turnstile

Turnstile no hace falta para el enlace directo a WhatsApp ni para una landing estatica.

Si despues agregas:

- formulario propio de contacto
- chat embebido
- endpoint publico que reciba texto libre

entonces si conviene poner Turnstile antes de aceptar el request.

## Checklist rapido antes de publicar

- `site-config.js` sin numeros o correos no deseados
- `.dev.vars` fuera de git
- secretos solo en Cloudflare Pages
- `npm run validate`
- prueba manual del flujo de agenda
- prueba manual del enlace de WhatsApp
