export function applyOptionalLink(element, href) {
  if (!element) {
    return false;
  }

  if (!href) {
    element.hidden = true;
    element.removeAttribute("href");
    return false;
  }

  element.hidden = false;
  element.href = href;
  return true;
}