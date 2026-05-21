# Quickstart: FAQ + WhatsApp CTA

## 1. Update editable content

1. Open `site-config.js`.
2. Add or update the `faq` content block with section copy, CTA copy, and FAQ items.
3. Leave `contact.whatsappNumber` populated to test the CTA-visible state.

## 2. Validate the repository

Run:

```bash
npm run validate
```

Expected result: repository validation passes and the static build completes.

## 3. Manual browser smoke test

1. Open `index.html` directly or serve the folder with a static server.
2. Confirm the FAQ section appears after `Proceso de atencion` and before `Agenda`.
3. Open and close each FAQ item with mouse/touch.
4. Repeat one FAQ interaction using keyboard only.
5. Confirm the FAQ WhatsApp CTA opens the expected destination when a number is configured.

## 4. Verify fallback behavior

1. Temporarily clear `contact.whatsappNumber` in `site-config.js`.
2. Reload the page.
3. Confirm the FAQ CTA is hidden and no broken link is rendered.
4. Restore the original config value after the check.
