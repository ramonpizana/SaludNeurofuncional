# Quickstart: Meta WhatsApp Cloud API + Security

## 1. Guardar secretos en Cloudflare Pages

Agrega:

- `WHATSAPP_PROVIDER=meta`
- `META_APP_SECRET`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_VERIFY_TOKEN`
- `META_WHATSAPP_API_VERSION=v25.0`
- `META_TEMPLATE_LANGUAGE_CODE=en_US`

Si despues usaras mensajes de agenda por Meta:

- `META_TEMPLATE_BOOKING_CREATED`
- `META_TEMPLATE_BOOKING_RESCHEDULED`
- `META_TEMPLATE_BOOKING_CANCELLED`

## 2. Configurar webhook en Meta

Callback URL:

```text
https://saludneurofuncional.pages.dev/api/webhooks/meta/whatsapp
```

Verification token:

- usa exactamente el mismo valor que guardaste en `META_WHATSAPP_VERIFY_TOKEN`

Suscribe al menos:

- `messages`

## 3. Validar localmente

```bash
npm run validate
```

## 4. Prueba manual recomendada

1. Verifica el webhook en Meta.
2. Envia un mensaje al numero conectado.
3. Confirma que la respuesta automatica llega.
4. Si quieres probar agenda por Meta, configura plantillas reales y dispara un webhook de Cal.com.
