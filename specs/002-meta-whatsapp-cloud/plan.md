# Implementation Plan: Meta WhatsApp Cloud API + Security

**Branch**: `[002-meta-whatsapp-cloud]` | **Date**: 2026-05-20 | **Spec**: [spec.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/specs/002-meta-whatsapp-cloud/spec.md)

**Input**: Feature specification from `/specs/002-meta-whatsapp-cloud/spec.md`

## Summary

Add direct Meta WhatsApp Cloud API support alongside the existing Twilio flow,
including a secure webhook endpoint for verification and inbound replies, a
runtime provider switch for Cal.com booking notifications, and documentation
that keeps tokens and secrets in Cloudflare Pages rather than in the repo.

## Technical Context

**Language/Version**: JavaScript ES modules in the browser and Cloudflare Pages Functions; Node.js >=20 for validation and build tooling

**Primary Dependencies**: Existing frontend modules, existing Cal.com/Twilio utilities, Cloudflare Pages Functions runtime, Meta Graph API over `fetch`

**Storage**: No new database in this iteration

**Testing**: `npm run validate`; manual webhook verification in Meta; manual inbound message smoke test; optional manual Cal.com webhook test with provider switch

**Target Platform**: Cloudflare Pages with Functions and modern browsers for the landing page

**Project Type**: Static landing page with edge webhook integrations

**Performance Goals**: Webhook verification and inbound responses should complete quickly enough to satisfy Meta and provider retries should not be triggered by slow or malformed handling

**Constraints**: No secrets in client code; no local `.env` committed; preserve the static-first site; keep provider-specific code in `server/` and `functions/`

**Scale/Scope**: One new provider module, one new webhook endpoint, one provider-selection update in Cal.com webhook handling, and documentation/spec updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Static-First Experience**: PASS. The landing stays static and no authenticated browser flow is added.
- **II. Public Config and Secret Boundary**: PASS. Meta tokens and app secret stay in runtime secrets; only public CTA copy remains in `site-config.js`.
- **III. Validation Gate**: PASS. The feature keeps `npm run validate` as the required merge gate.
- **IV. Isolated Integrations**: PASS. Provider-specific messaging logic is isolated in `server/meta-whatsapp.js` and dedicated webhook handlers.
- **V. Documentation-Backed Delivery**: PASS. README, CONFIGURATION, DEPLOYMENT, SECURITY, and Spec Kit artifacts are updated in the same unit of work.

## Project Structure

### Documentation (this feature)

```text
specs/002-meta-whatsapp-cloud/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- tasks.md
```

### Source Code (repository root)

```text
functions/
`-- api/
    `-- webhooks/
        |-- calcom.js
        |-- twilio/inbound.js
        `-- meta/whatsapp.js
server/
|-- meta-whatsapp.js
|-- request-guards.js
|-- runtime-config.js
`-- twilio.js
.dev.vars.example
README.md
CONFIGURATION.md
DEPLOYMENT.md
SECURITY.md
ARCHITECTURE.md
```

**Structure Decision**: Keep the landing untouched at the rendering layer and
extend the existing edge integration layer with one Meta-specific module and
one Meta-specific webhook endpoint, while reusing the current Cal.com entry
point and provider-selection runtime config.

## Complexity Tracking

No constitution violations are expected. The main operational complexity is
provider coordination and secure secret handling, which is why the work stays
inside `functions/`, `server/`, and documentation.
