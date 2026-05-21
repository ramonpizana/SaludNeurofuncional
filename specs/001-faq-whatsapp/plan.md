# Implementation Plan: FAQ + WhatsApp CTA

**Branch**: `[001-faq-whatsapp]` | **Date**: 2026-05-19 | **Spec**: [spec.md](C:/Users/ramon/Documents/EdisonPage/SaludNeurofuncional/specs/001-faq-whatsapp/spec.md)

**Input**: Feature specification from `/specs/001-faq-whatsapp/spec.md`

## Summary

Add a new FAQ section between the existing process and booking sections, source
its content from the public site configuration, render the interaction through a
dedicated frontend feature module, and reuse the current WhatsApp contact logic
for a contextual CTA without changing webhook or secret-handling code.

## Technical Context

**Language/Version**: JavaScript ES modules in the browser; Node.js >=20 for validation and build tooling

**Primary Dependencies**: Existing frontend feature modules, browser DOM APIs, `app/utils/whatsapp.js`, static build scripts, no new third-party packages

**Storage**: N/A

**Testing**: `npm run validate`; manual browser smoke test for FAQ expansion, keyboard navigation, and WhatsApp CTA states

**Target Platform**: Cloudflare Pages static site in modern desktop and mobile browsers

**Project Type**: Static web application / landing page with optional edge integrations

**Performance Goals**: FAQ items open or close in a single interaction without noticeable delay, and the static build output remains unchanged except for the new feature assets

**Constraints**: No secrets in client code; no new runtime service dependency; preserve the existing appointment form and current WhatsApp entry points; keep the UI accessible and mobile-friendly

**Scale/Scope**: One new landing section, one new frontend feature module, a small public-config extension, and small documentation updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Static-First Experience**: PASS. The feature is a static landing enhancement with browser-only interaction.
- **II. Public Config and Secret Boundary**: PASS. FAQ content and CTA copy stay in public config; no secrets are introduced.
- **III. Validation Gate**: PASS. The plan includes `npm run validate` and a focused manual smoke test before handoff.
- **IV. Isolated Integrations**: PASS. Existing WhatsApp URL generation is reused; webhook modules remain untouched.
- **V. Documentation-Backed Delivery**: PASS. The plan includes README and CONFIGURATION updates for the editable FAQ content.

## Project Structure

### Documentation (this feature)

```text
specs/001-faq-whatsapp/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- tasks.md
```

### Source Code (repository root)

```text
index.html
site-config.js
app/
|-- config.js
|-- dom.js
|-- main.js
|-- features/
|   |-- appointment-form.js
|   |-- booking-mode.js
|   |-- branding.js
|   |-- faq.js
|   `-- whatsapp-links.js
|-- utils/
|   `-- whatsapp.js
styles/
|-- components.css
|-- responsive.css
`-- sections.css
README.md
CONFIGURATION.md
```

**Structure Decision**: Extend the existing single-page frontend structure by
adding one dedicated FAQ feature module and reusing the current config, DOM, and
WhatsApp utility boundaries.

## Complexity Tracking

No constitution violations or exceptional complexity are expected for this
feature.
