# Feature Specification: Meta WhatsApp Cloud API + Security

**Feature Branch**: `002-meta-whatsapp-cloud`

**Created**: 2026-05-20

**Status**: Draft

**Input**: User description: "Conectar Meta WhatsApp Cloud API, guiar setup de token y webhook, mantenerlo seguro y util para agenda y respuestas basicas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Responder mensajes entrantes desde Meta (Priority: P1)

Como operadora del sitio, quiero recibir mensajes entrantes en el webhook de
Meta y responder con un mensaje automatico basico para orientar a la persona
hacia la agenda o resolver dudas comunes.

**Why this priority**: Es la integracion mas visible para el usuario final y la
que valida que el webhook de Meta esta realmente funcionando de extremo a
extremo.

**Independent Test**: Configurar el webhook de Meta, escribirle al numero
conectado y confirmar que llega una respuesta automatica valida.

**Acceptance Scenarios**:

1. **Given** que Meta verifica el webhook correctamente, **When** una persona
   envia un mensaje al numero conectado, **Then** el sistema recibe el payload y
   responde con un texto automatico seguro.
2. **Given** que llega un payload sin mensaje util o de otro tipo, **When** el
   endpoint lo procesa, **Then** responde `ok` o `ignored` sin romper el flujo.

---

### User Story 2 - Configurar secretos sin exponerlos (Priority: P1)

Como administradora del proyecto, quiero saber donde poner access token, app
secret, phone number id y verify token para no filtrarlos en el repo ni en el
frontend.

**Why this priority**: La integracion pierde valor si termina exponiendo
credenciales sensibles en GitHub o en la landing.

**Independent Test**: Seguir la documentacion del repo, guardar los secretos en
Cloudflare Pages y verificar el webhook sin editar archivos versionados con
credenciales reales.

**Acceptance Scenarios**:

1. **Given** que la integracion requiere credenciales de Meta, **When** la
   administradora sigue la guia, **Then** sabe exactamente que valor va en cada
   variable o secreto de Cloudflare.
2. **Given** que el repositorio se valida, **When** se revisan los archivos
   publicos, **Then** no aparecen tokens reales ni secretos incrustados.

---

### User Story 3 - Elegir proveedor de WhatsApp para mensajes de agenda (Priority: P2)

Como dueña del flujo operativo, quiero elegir si las confirmaciones de agenda
se envian por Twilio o por Meta para no quedar atada a un solo proveedor.

**Why this priority**: Permite moverse a Meta directo, que suele ser mas simple
para este caso y evita rehacer el webhook de Cal.com desde cero.

**Independent Test**: Cambiar `WHATSAPP_PROVIDER`, disparar un webhook de
Cal.com y confirmar que el envio sale por el proveedor configurado o que el
sistema explica claramente por que se omite.

**Acceptance Scenarios**:

1. **Given** que `WHATSAPP_PROVIDER=meta`, **When** Cal.com reporta una reserva,
   **Then** el sistema intenta enviar la notificacion usando Meta Cloud API.
2. **Given** que faltan plantillas o credenciales del proveedor activo,
   **When** llega el webhook de Cal.com, **Then** el sistema devuelve un error o
   `skipped` claro sin filtrar secretos.

---

### Edge Cases

- Que ocurre si Meta envia un POST sin `x-hub-signature-256`?
- Que ocurre si el payload supera el tamano esperado?
- Que ocurre si la URL del webhook es correcta pero el verify token no coincide?
- Que ocurre si el numero del paciente no viene en Cal.com para el proveedor
  activo?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a Meta webhook endpoint that supports GET
  verification and POST message processing.
- **FR-002**: The system MUST validate the Meta verification token during the
  webhook challenge flow.
- **FR-003**: The system MUST validate the `x-hub-signature-256` header for
  incoming Meta POST requests before processing the payload.
- **FR-004**: The system MUST reject unsupported content types and oversized
  payloads for WhatsApp webhooks.
- **FR-005**: The system MUST send a basic automatic reply for supported inbound
  Meta messages without exposing secrets in client code.
- **FR-006**: The system MUST allow selecting the outbound WhatsApp provider for
  Cal.com notifications through runtime configuration.
- **FR-007**: The system MUST keep Meta and Twilio credentials outside the repo
  and document their placement in Cloudflare Pages.
- **FR-008**: The system MUST preserve the current static landing behavior and
  public WhatsApp CTA behavior.

### Key Entities *(include if feature involves data)*

- **Meta Webhook Challenge**: Verification request containing `hub.mode`,
  `hub.verify_token`, and `hub.challenge`.
- **Meta Inbound Message**: Incoming WhatsApp payload with sender, profile, and
  message content.
- **WhatsApp Provider Config**: Runtime selection and credential set used to
  send booking notifications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Meta can verify the webhook callback URL successfully using the
  documented verification token.
- **SC-002**: A manual inbound WhatsApp test receives an automatic reply within
  one interaction after the message reaches the webhook.
- **SC-003**: `npm run validate` passes with no secrets committed to the repo.
- **SC-004**: A developer can switch between Twilio and Meta by changing
  runtime configuration without editing client-side code.

## Assumptions

- The first Meta iteration will use simple rule-based auto replies, not a full
  LLM bot.
- Cloudflare Pages remains the public runtime for webhook endpoints.
- Meta templates for booking events may be configured later; the system can
  safely skip outbound sends until those names exist.
