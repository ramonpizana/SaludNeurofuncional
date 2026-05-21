# Tasks: FAQ + WhatsApp CTA

**Input**: Design documents from `/specs/001-faq-whatsapp/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are not explicitly requested in the specification. Validation uses `npm run validate` plus a manual browser smoke test.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the public config and frontend integration points for the FAQ feature.

- [ ] T001 Extend the public site configuration shape for FAQ content in `site-config.js`
- [ ] T002 Normalize the FAQ configuration defaults in `app/config.js`
- [ ] T003 [P] Register FAQ section nodes and CTA hooks in `app/dom.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared structure and feature wiring required by all user stories.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T004 Add the FAQ section markup scaffold between `#proceso` and `#agenda` in `index.html`
- [ ] T005 [P] Create the FAQ feature module scaffold in `app/features/faq.js`
- [ ] T006 Wire FAQ initialization into `app/main.js`
- [ ] T007 [P] Add FAQ component styling in `styles/components.css`
- [ ] T008 [P] Add FAQ section layout and responsive styling in `styles/sections.css` and `styles/responsive.css`

**Checkpoint**: The codebase is ready for independent FAQ story implementation.

---

## Phase 3: User Story 1 - Resolver dudas frecuentes (Priority: P1) MVP

**Goal**: Render the FAQ content and let visitors expand or collapse answers without affecting the rest of the landing.

**Independent Test**: Load the page, open the FAQ section, and confirm each item can be opened and closed accessibly on desktop and mobile.

### Implementation for User Story 1

- [ ] T009 [US1] Add the first-pass FAQ content entries in `site-config.js`
- [ ] T010 [US1] Render FAQ items from config in `app/features/faq.js`
- [ ] T011 [US1] Implement accordion toggle behavior and accessibility state updates in `app/features/faq.js`
- [ ] T012 [US1] Refine FAQ copy hierarchy and spacing in `index.html` and `styles/sections.css`

**Checkpoint**: User Story 1 should be fully functional and testable on its own.

---

## Phase 4: User Story 2 - Contactar por WhatsApp desde la FAQ (Priority: P2)

**Goal**: Allow visitors to contact the clinic through a contextual WhatsApp CTA from the FAQ section.

**Independent Test**: With a configured WhatsApp number, clicking the FAQ CTA opens the expected destination; without a number, the CTA stays hidden.

### Implementation for User Story 2

- [ ] T013 [US2] Add the FAQ CTA copy and helper content to `site-config.js`
- [ ] T014 [US2] Reuse the WhatsApp URL builder for the FAQ CTA in `app/features/faq.js`
- [ ] T015 [US2] Ensure CTA visibility gracefully follows the configured WhatsApp destination in `app/features/faq.js`

**Checkpoint**: User Stories 1 and 2 should both work independently without breaking the booking flow.

---

## Phase 5: User Story 3 - Mantener el contenido sin tocar flujos sensibles (Priority: P3)

**Goal**: Keep FAQ content easy to update and document where editors should make those changes.

**Independent Test**: Update FAQ copy from the documented files, reload the site, and confirm the changes appear without editing webhook or secret-handling modules.

### Implementation for User Story 3

- [ ] T016 [US3] Add inline editor guidance for FAQ content in `site-config.js`
- [ ] T017 [US3] Document FAQ content editing and WhatsApp fallback behavior in `README.md` and `CONFIGURATION.md`
- [ ] T018 [US3] Align the feature quickstart verification steps in `specs/001-faq-whatsapp/quickstart.md`

**Checkpoint**: All user stories are independently functional and maintainable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and delivery checks across the feature.

- [ ] T019 [P] Run `npm run validate`
- [ ] T020 Verify FAQ placement, keyboard interaction, and WhatsApp CTA fallback in `index.html`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 layout and FAQ hooks
- **User Story 3 (Phase 5)**: Depends on the final content shape from User Stories 1 and 2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and delivers the MVP on its own
- **User Story 2 (P2)**: Builds on the FAQ section from US1 but keeps the contact behavior isolated
- **User Story 3 (P3)**: Documents and stabilizes the editable content after the feature behavior is in place

### Parallel Opportunities

- T003 can run in parallel with T001-T002 after the config shape is clear.
- T005, T007, and T008 can run in parallel after the section markup strategy is agreed.
- T017 and T018 can run in parallel once the final content model is stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add the first-pass FAQ content entries in site-config.js"
Task: "Refine FAQ copy hierarchy and spacing in index.html and styles/sections.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate FAQ rendering and accessibility before expanding scope

### Incremental Delivery

1. Deliver FAQ rendering first
2. Add contextual WhatsApp conversion next
3. Finish with editor guidance and documentation
4. Run full validation and smoke test before handoff

### Notes

- Keep the feature within the existing modular frontend architecture.
- Do not introduce secrets, provider tokens, or hidden runtime dependencies.
- Preserve the current booking form and existing WhatsApp links while adding the FAQ-specific CTA.
