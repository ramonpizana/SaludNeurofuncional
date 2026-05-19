import { applyOptionalLink } from "../utils/links.js";
import { buildWhatsAppUrl } from "../utils/whatsapp.js";

export function applyWhatsAppLinks(siteConfig, dom) {
  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.contact.whatsappNumber,
    siteConfig.contact.whatsappDefaultMessage
  );

  [dom.whatsappSidebarLink, dom.whatsappExternalLink].forEach((element) => {
    applyOptionalLink(element, whatsappUrl);
  });
}