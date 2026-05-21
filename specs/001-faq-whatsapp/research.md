# Research: FAQ + WhatsApp CTA

## Decision 1: Store FAQ content in public site configuration

- **Decision**: Add a new `faq` object to `site-config.js` and normalize it in
  `app/config.js`.
- **Rationale**: The repository already uses `site-config.js` as the editable,
  public-safe source for site copy and contact behavior. Keeping FAQ content in
  the same place satisfies the maintainability story without mixing editorial
  data into markup or sensitive runtime modules.
- **Alternatives considered**:
  - Hardcode FAQ content directly in `index.html`: rejected because it makes
    content changes less discoverable and less reusable.
  - Create a remote CMS: rejected because it adds unnecessary operational scope
    for a simple landing-page section.

## Decision 2: Implement FAQ interaction as a dedicated frontend feature module

- **Decision**: Create `app/features/faq.js` and initialize it from `app/main.js`.
- **Rationale**: The frontend is already organized by features. A dedicated
  module keeps accordion rendering, accessibility state, and CTA behavior
  isolated from branding, booking, and form logic.
- **Alternatives considered**:
  - Inline script in `index.html`: rejected because it breaks the modular
    architecture.
  - Fold the logic into `whatsapp-links.js`: rejected because FAQ rendering and
    accordion state are broader than link decoration.

## Decision 3: Place the FAQ section between process and booking

- **Decision**: Insert the FAQ section after `#proceso` and before `#agenda` in
  `index.html`.
- **Rationale**: Visitors often need one more layer of reassurance before moving
  into booking. Positioning FAQ immediately before agenda supports that flow and
  creates a natural bridge to the WhatsApp CTA.
- **Alternatives considered**:
  - Place FAQ after booking: rejected because it delays useful information until
    after the conversion step.
  - Place FAQ near the hero: rejected because the page already uses the early
    sections to establish services and process context.

## Decision 4: Reuse existing WhatsApp URL generation

- **Decision**: Reuse `app/utils/whatsapp.js` to generate the FAQ CTA target and
  hide the CTA when no valid destination is available.
- **Rationale**: This preserves a single source of truth for WhatsApp link
  formatting and keeps fallback behavior aligned across the page.
- **Alternatives considered**:
  - Generate the WhatsApp URL in the FAQ module from scratch: rejected because it
    duplicates existing logic.
  - Keep the CTA visible with a placeholder href: rejected because the
    constitution requires safe fallback behavior and no broken links.
