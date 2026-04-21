function query(selector) {
  return document.querySelector(selector);
}

export function getDomNodes() {
  return {
    form: query("#appointment-form"),
    dateField: query("#appointment-date"),
    timeField: query("#appointment-time"),
    timeSlots: query("#time-slots"),
    confirmationCard: query("#confirmation-card"),
    confirmationTitle: query("#confirmation-title"),
    confirmationDetails: query("#confirmation-details"),
    icsDownload: query("#ics-download"),
    brandMark: query("#brand-mark"),
    brandName: query("#brand-name"),
    brandTagline: query("#brand-tagline"),
    footerBrandName: query("#footer-brand-name"),
    bookingLocationLabel: query("#booking-location-label"),
    bookingSectionCopy: query("#booking-section-copy"),
    externalBookingPanel: query("#external-booking-panel"),
    externalBookingLink: query("#external-booking-link"),
    externalBookingDescription: query("#external-booking-description"),
    whatsappSidebarLink: query("#whatsapp-link-sidebar"),
    whatsappExternalLink: query("#whatsapp-link-external"),
    headerCta: query("#header-cta"),
    primaryCta: query("#primary-cta")
  };
}
