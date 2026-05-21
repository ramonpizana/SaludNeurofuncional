# Research: Meta WhatsApp Cloud API + Security

## Decision 1: Use Meta Cloud API directly instead of installing the sample repo

- **Decision**: Integrate Meta directly from Cloudflare Pages Functions.
- **Rationale**: The project already has a static site plus edge webhook architecture. Adding a separate Node app from the sample repo would duplicate infrastructure and operational surface.
- **Alternatives considered**:
  - Install `fbsamples/whatsapp-business-jaspers-market`: rejected for this repo because it expects a separate server workflow and extra local setup.
  - Stay only on Twilio: kept as a supported fallback, but not ideal when Meta direct access is already working.

## Decision 2: Keep provider selection at runtime

- **Decision**: Introduce `WHATSAPP_PROVIDER` with `twilio` as backward-compatible default and `meta` as the direct Cloud API option.
- **Rationale**: This avoids breaking the existing Twilio flow while allowing incremental migration.
- **Alternatives considered**:
  - Hard switch everything to Meta: rejected because it would force migration in one step.
  - Maintain totally separate Cal.com webhook handlers: rejected because it duplicates logic.

## Decision 3: Validate Meta signatures and challenge inside Functions

- **Decision**: Handle `hub.challenge`, verify token, and `x-hub-signature-256` inside `functions/api/webhooks/meta/whatsapp.js`.
- **Rationale**: This keeps secrets server-side and aligns with the current integration boundary.
- **Alternatives considered**:
  - Proxy through another service or automation tool first: rejected as unnecessary for the current scope.
