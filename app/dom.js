function query(selector) {
  return document.querySelector(selector);
}

export function getDomNodes() {
  return {
    faqNavLink: query('[data-nav="faq"]'),
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
    faqSection: query("#preguntas"),
    faqEyebrow: query("#faq-eyebrow"),
    faqTitle: query("#faq-title"),
    faqIntro: query("#faq-intro"),
    faqList: query("#faq-list"),
    faqCtaCard: query("#faq-cta-card"),
    faqCtaKicker: query("#faq-cta-kicker"),
    faqCtaTitle: query("#faq-cta-title"),
    faqCtaHelper: query("#faq-cta-helper"),
    faqCtaLink: query("#faq-whatsapp-link"),
    headerCta: query("#header-cta"),
    primaryCta: query("#primary-cta")
  };
}