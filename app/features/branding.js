export function applyBranding(siteConfig, dom) {
  const {
    brandMark,
    brandName,
    brandTagline,
    footerBrandName,
    bookingLocationLabel
  } = dom;

  brandMark.textContent = siteConfig.shortName;
  brandName.textContent = siteConfig.clinicName;
  brandTagline.textContent = siteConfig.tagline;
  footerBrandName.textContent = siteConfig.clinicName;
  bookingLocationLabel.textContent = siteConfig.locationLabel;
  document.title = `${siteConfig.clinicName} | Fisioterapia y rehabilitacion personalizada`;
}
