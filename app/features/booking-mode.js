export function applyBookingMode(siteConfig, dom) {
  const isExternalBooking =
    siteConfig.booking.mode === "external" && Boolean(siteConfig.booking.externalUrl);

  if (!isExternalBooking) {
    return false;
  }

  dom.form.hidden = true;
  dom.confirmationCard.hidden = true;
  dom.externalBookingPanel.hidden = false;
  dom.externalBookingLink.href = siteConfig.booking.externalUrl;
  dom.externalBookingLink.textContent = siteConfig.booking.externalLabel;
  dom.externalBookingDescription.textContent =
    "Esta version queda lista para abrir una agenda externa con disponibilidad real y evitar doble reservacion.";
  dom.bookingSectionCopy.textContent =
    "La agenda de esta pagina puede apuntar a Cal.com o Calendly. Cuando se configure esa URL, el flujo de reserva se hace en la agenda oficial y ya no depende de este formulario local.";
  dom.headerCta.href = siteConfig.booking.externalUrl;
  dom.primaryCta.href = siteConfig.booking.externalUrl;
  dom.headerCta.target = "_blank";
  dom.primaryCta.target = "_blank";
  dom.headerCta.rel = "noopener";
  dom.primaryCta.rel = "noopener";
  dom.headerCta.textContent = siteConfig.booking.externalLabel;
  dom.primaryCta.textContent = siteConfig.booking.externalLabel;
  return true;
}
