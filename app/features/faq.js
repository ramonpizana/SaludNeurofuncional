import { applyOptionalLink } from "../utils/links.js";
import { buildWhatsAppUrl } from "../utils/whatsapp.js";

function createFaqItem(item) {
  const article = document.createElement("article");
  article.className = "faq-item";
  article.setAttribute("role", "listitem");

  const heading = document.createElement("h3");
  heading.className = "faq-question";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "faq-trigger";
  button.id = `faq-trigger-${item.id}`;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", `faq-panel-${item.id}`);

  const label = document.createElement("span");
  label.className = "faq-trigger-label";
  label.textContent = item.question;

  const icon = document.createElement("span");
  icon.className = "faq-trigger-icon";
  icon.setAttribute("aria-hidden", "true");

  button.append(label, icon);
  heading.append(button);

  const panel = document.createElement("div");
  panel.className = "faq-panel";
  panel.id = `faq-panel-${item.id}`;
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-labelledby", button.id);
  panel.hidden = true;

  const answer = document.createElement("p");
  answer.textContent = item.answer;
  panel.append(answer);

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });

  article.append(heading, panel);
  return article;
}

export function initializeFaq(siteConfig, dom) {
  const {
    faqNavLink,
    faqSection,
    faqEyebrow,
    faqTitle,
    faqIntro,
    faqList,
    faqCtaCard,
    faqCtaKicker,
    faqCtaTitle,
    faqCtaHelper,
    faqCtaLink
  } = dom;

  if (!faqSection || !faqList) {
    return;
  }

  const faq = siteConfig.faq || {};
  const items = Array.isArray(faq.items) ? faq.items : [];

  if (!items.length) {
    faqSection.hidden = true;

    if (faqNavLink) {
      faqNavLink.hidden = true;
    }

    return;
  }

  faqSection.hidden = false;

  if (faqNavLink) {
    faqNavLink.hidden = false;
  }

  faqEyebrow.textContent = faq.eyebrow;
  faqTitle.textContent = faq.title;
  faqIntro.textContent = faq.intro;

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    fragment.append(createFaqItem(item));
  });

  faqList.replaceChildren(fragment);

  faqCtaKicker.textContent = faq.ctaKicker;
  faqCtaTitle.textContent = faq.ctaTitle;
  faqCtaHelper.textContent = faq.ctaHelper;
  faqCtaLink.textContent = faq.ctaLabel;

  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.contact.whatsappNumber,
    faq.ctaMessage || siteConfig.contact.whatsappDefaultMessage
  );

  const hasFaqCta = applyOptionalLink(faqCtaLink, whatsappUrl);
  faqCtaCard.hidden = !hasFaqCta;
}