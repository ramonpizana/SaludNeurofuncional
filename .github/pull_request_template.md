## Summary

- Describe the change clearly.
- Call out any user-facing behavior, migration note, or operational risk.

## Scope

- [ ] Frontend / UX
- [ ] Public configuration (`site-config.js`)
- [ ] Cloudflare Functions / webhooks
- [ ] Documentation / repo policy
- [ ] GitHub workflow or CI behavior

## Validation

- [ ] `npm run validate`
- [ ] Desktop visual test completed when UI changed
- [ ] Mobile visual test completed when UI changed
- [ ] External links, booking flow, or WhatsApp CTA verified when affected

## Security and Data Safety

- [ ] No secrets, credentials, tokens, or private keys were committed
- [ ] No patient or prospect personal data was added
- [ ] New public config values are safe to expose in `site-config.js`
- [ ] New workflows use minimal permissions

## Deployment and Rollback

- [ ] This change is safe to deploy by merging into `main`
- [ ] Any required Cloudflare or GitHub settings changes were documented
- [ ] Rollback plan is clear if the change touches booking, webhook, or messaging flows

## Notes for Reviewers

- Screenshots, test notes, or manual verification details: