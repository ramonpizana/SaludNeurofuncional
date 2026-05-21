function normalizeHeaderValue(value) {
  return String(value || "").trim();
}

export function getContentType(request) {
  const header = normalizeHeaderValue(request.headers.get("content-type"));

  if (!header) {
    return "";
  }

  return header.split(";")[0].trim().toLowerCase();
}

export function hasAllowedContentType(request, allowedTypes = []) {
  const contentType = getContentType(request);

  if (!contentType || !allowedTypes.length) {
    return false;
  }

  return allowedTypes.some((allowedType) => contentType === String(allowedType).trim().toLowerCase());
}

export function getContentLength(request) {
  const rawValue = normalizeHeaderValue(request.headers.get("content-length"));

  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
