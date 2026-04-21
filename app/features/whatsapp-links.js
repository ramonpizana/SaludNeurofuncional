import { buildWhatsAppUrl } from "../utils/whatsapp.js";

export function applyWhatsAppLinks(siteConfig, dom) {
  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.contact.whatsappNumber,
    siteConfig.contact.whatsappDefaultMessage
  );

  [dom.whatsappSidebarLink, dom.whatsappExternalLink].forEach((element) => {
    if (!whatsappUrl) {
      element.hidden = true;
      element.removeAttribute("href");
      return;
    }

    element.hidden = false;
    element.href = whatsappUrl;
  });
}
