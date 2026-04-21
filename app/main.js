import { getSiteConfig } from "./config.js";
import { getDomNodes } from "./dom.js";
import { initializeAppointmentForm } from "./features/appointment-form.js";
import { applyBookingMode } from "./features/booking-mode.js";
import { applyBranding } from "./features/branding.js";
import { applyWhatsAppLinks } from "./features/whatsapp-links.js";

export function initSite() {
  const siteConfig = getSiteConfig();
  const dom = getDomNodes();

  applyBranding(siteConfig, dom);
  applyWhatsAppLinks(siteConfig, dom);
  const usesExternalBooking = applyBookingMode(siteConfig, dom);

  if (!usesExternalBooking) {
    initializeAppointmentForm(siteConfig, dom);
  }
}
