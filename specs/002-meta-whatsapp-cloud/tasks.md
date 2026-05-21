# Tasks: Meta WhatsApp Cloud API + Security

**Input**: Design documents from `/specs/002-meta-whatsapp-cloud/`

**Prerequisites**: plan.md, spec.md

**Tests**: Validation uses `npm run validate` plus manual webhook verification and inbound WhatsApp smoke testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Extend runtime configuration for provider selection and Meta secrets in `server/runtime-config.js` and `.dev.vars.example`
- [ ] T002 [P] Update repository validation and build expectations for new Meta files in `scripts/validate-repo.mjs`
- [ ] T003 [P] Update active Spec Kit pointers in `AGENTS.md` and `.specify/feature.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Create shared Meta webhook utilities in `server/meta-whatsapp.js`
- [ ] T005 [P] Reuse request guards for JSON webhooks in `server/request-guards.js`
- [ ] T006 Wire provider selection into `functions/api/webhooks/calcom.js`

---

## Phase 3: User Story 1 - Responder mensajes entrantes desde Meta (Priority: P1)

**Goal**: Receive and answer inbound Meta WhatsApp messages through a secure Cloudflare endpoint.

**Independent Test**: Verify the Meta webhook URL, send a WhatsApp message to the connected number, and confirm that the automatic reply is delivered.

- [ ] T007 [US1] Add GET verification and POST signature validation flow in `functions/api/webhooks/meta/whatsapp.js`
- [ ] T008 [US1] Extract inbound sender and message text from Meta payloads in `server/meta-whatsapp.js`
- [ ] T009 [US1] Send rule-based automatic replies through Meta Graph API in `server/meta-whatsapp.js` and `functions/api/webhooks/meta/whatsapp.js`

---

## Phase 4: User Story 2 - Configurar secretos sin exponerlos (Priority: P1)

**Goal**: Document and preserve the secret boundary for Meta and Twilio credentials.

**Independent Test**: Follow the docs to place secrets in Cloudflare Pages and verify the webhook without adding credentials to versioned files.

- [ ] T010 [US2] Document Cloudflare variables, secrets, callback URL, and verification token in `CONFIGURATION.md`
- [ ] T011 [P] Document deployment and verification steps for Meta in `DEPLOYMENT.md`
- [ ] T012 [P] Document provider choice and operational guidance in `README.md`, `SECURITY.md`, and `ARCHITECTURE.md`

---

## Phase 5: User Story 3 - Elegir proveedor de WhatsApp para mensajes de agenda (Priority: P2)

**Goal**: Allow Cal.com notifications to be sent by either Twilio or Meta using runtime configuration.

**Independent Test**: Switch `WHATSAPP_PROVIDER`, trigger the Cal.com webhook, and confirm the response path matches the configured provider.

- [ ] T013 [US3] Add provider readiness checks and provider reporting to `functions/api/webhooks/calcom.js`
- [ ] T014 [US3] Send outbound booking notifications through Meta templates when `WHATSAPP_PROVIDER=meta` in `functions/api/webhooks/calcom.js` and `server/meta-whatsapp.js`
- [ ] T015 [US3] Preserve Twilio compatibility and fallback behavior in `functions/api/webhooks/calcom.js`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Run `npm run validate`
- [ ] T017 Confirm webhook endpoints and documentation references stay aligned across `README.md`, `CONFIGURATION.md`, and `DEPLOYMENT.md`
- [ ] T018 Review public WhatsApp CTA behavior to ensure no secret values leak into `site-config.js`
