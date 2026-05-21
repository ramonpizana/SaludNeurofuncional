import { applyOptionalLink } from "../utils/links.js";
import { buildPublicWhatsAppLink } from "../utils/whatsapp.js";

export function applyWhatsAppLinks(siteConfig, dom) {
  const links = [
    {
      element: dom.whatsappSidebarLink,
      href: buildPublicWhatsAppLink(siteConfig.contact, {
        source: "booking-sidebar"
      })
    },
    {
      element: dom.whatsappExternalLink,
      href: buildPublicWhatsAppLink(siteConfig.contact, {
        source: "booking-external"
      })
    }
  ];

  links.forEach(({ element, href }) => {
    applyOptionalLink(element, href);
  });
}
