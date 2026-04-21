const defaultScheduleByDay = {
  0: [],
  1: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  2: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  3: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  4: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  5: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  6: ["09:00", "10:30", "12:00"]
};

const configuredSite = window.SN_SITE_CONFIG || {};
const bookingConfig = {
  mode: "form",
  externalUrl: "",
  externalLabel: "Abrir agenda online",
  durationMinutes: 60,
  timezone: "America/Mexico_City",
  ...(configuredSite.booking || {})
};
const contactConfig = {
  whatsappNumber: "",
  whatsappDefaultMessage: "Hola, quiero agendar una valoracion.",
  email: "",
  phoneDisplay: "",
  ...(configuredSite.contact || {})
};
const siteConfig = {
  clinicName: configuredSite.clinicName || "Salud Neurofuncional",
  shortName: configuredSite.shortName || "SN",
  tagline: configuredSite.tagline || "Fisioterapia personalizada",
  locationLabel: configuredSite.locationLabel || "Consultorio Salud Neurofuncional",
  booking: bookingConfig,
  contact: contactConfig,
  scheduleByDay: {
    ...defaultScheduleByDay,
    ...(configuredSite.scheduleByDay || {})
  }
};

const form = document.querySelector("#appointment-form");
const dateField = document.querySelector("#appointment-date");
const timeField = document.querySelector("#appointment-time");
const timeSlots = document.querySelector("#time-slots");
const confirmationCard = document.querySelector("#confirmation-card");
const confirmationTitle = document.querySelector("#confirmation-title");
const confirmationDetails = document.querySelector("#confirmation-details");
const icsDownload = document.querySelector("#ics-download");
const brandMark = document.querySelector("#brand-mark");
const brandName = document.querySelector("#brand-name");
const brandTagline = document.querySelector("#brand-tagline");
const footerBrandName = document.querySelector("#footer-brand-name");
const bookingLocationLabel = document.querySelector("#booking-location-label");
const bookingSectionCopy = document.querySelector("#booking-section-copy");
const externalBookingPanel = document.querySelector("#external-booking-panel");
const externalBookingLink = document.querySelector("#external-booking-link");
const externalBookingDescription = document.querySelector("#external-booking-description");
const whatsappSidebarLink = document.querySelector("#whatsapp-link-sidebar");
const whatsappExternalLink = document.querySelector("#whatsapp-link-external");
const headerCta = document.querySelector("#header-cta");
const primaryCta = document.querySelector("#primary-cta");

let currentIcsUrl = "";

function toLocalDate(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

function cleanWhatsAppNumber(number) {
  return String(number || "").replace(/[^\d]/g, "");
}

function buildWhatsAppUrl(number, message) {
  const cleanNumber = cleanWhatsAppNumber(number);

  if (!cleanNumber) {
    return "";
  }

  const url = new URL(`https://wa.me/${cleanNumber}`);

  if (message) {
    url.searchParams.set("text", message);
  }

  return url.toString();
}

function getValidSlotsForDate(date) {
  const slots = siteConfig.scheduleByDay[date.getDay()] || [];
  const isToday = toLocalDate(date) === toLocalDate(new Date());

  if (!isToday) {
    return slots;
  }

  return slots.filter((slot) => {
    const [hours, minutes] = slot.split(":").map(Number);
    const slotDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );

    return slotDate.getTime() > Date.now();
  });
}

function getNextAvailableDate() {
  const today = new Date();

  for (let index = 0; index < 14; index += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + index);

    if (getValidSlotsForDate(candidate).length > 0) {
      return candidate;
    }
  }

  return today;
}

function formatReadableDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatCalendarToken(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function formatUtcToken(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeIcsText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function updateSelectedSlot(button) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.classList.remove("selected");
  });

  button.classList.add("selected");
  timeField.value = button.dataset.time;
}

function renderEmptyState(message) {
  timeSlots.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "time-empty";
  empty.textContent = message;
  timeSlots.appendChild(empty);
}

function renderTimeSlots(dateString) {
  timeField.value = "";
  timeSlots.innerHTML = "";

  if (!dateString) {
    renderEmptyState("Selecciona una fecha para ver horarios.");
    return;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const slots = siteConfig.scheduleByDay[selectedDate.getDay()] || [];

  if (slots.length === 0) {
    renderEmptyState("No hay horarios disponibles ese día.");
    return;
  }

  const validSlots = getValidSlotsForDate(selectedDate);

  if (validSlots.length === 0) {
    renderEmptyState("Los horarios de hoy ya pasaron. Prueba con otra fecha.");
    return;
  }

  validSlots.forEach((slot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-slot";
    button.textContent = slot;
    button.dataset.time = slot;
    button.addEventListener("click", () => updateSelectedSlot(button));
    timeSlots.appendChild(button);

    if (index === 0) {
      updateSelectedSlot(button);
    }
  });
}

function buildIcsFile({ title, description, location, start, end }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.clinicName}//Citas//ES`,
    "BEGIN:VEVENT",
    `UID:${Date.now()}@saludneurofuncional.local`,
    `DTSTAMP:${formatUtcToken(new Date())}`,
    `DTSTART:${formatUtcToken(start)}`,
    `DTEND:${formatUtcToken(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8"
  });
}

function releaseCurrentIcs() {
  if (currentIcsUrl) {
    URL.revokeObjectURL(currentIcsUrl);
    currentIcsUrl = "";
  }
}

function buildCalendarUrl({ title, description, location, start, end }) {
  const url = new URL("https://calendar.google.com/calendar/render");
  const timezone = siteConfig.booking.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";

  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("details", description);
  url.searchParams.set("location", location);
  url.searchParams.set("dates", `${formatCalendarToken(start)}/${formatCalendarToken(end)}`);
  url.searchParams.set("ctz", timezone);

  return url.toString();
}

function initializeDateField() {
  const firstDate = getNextAvailableDate();
  const localDate = toLocalDate(firstDate);
  dateField.min = toLocalDate(new Date());
  dateField.value = localDate;
  renderTimeSlots(localDate);
}

function applyBranding() {
  brandMark.textContent = siteConfig.shortName;
  brandName.textContent = siteConfig.clinicName;
  brandTagline.textContent = siteConfig.tagline;
  footerBrandName.textContent = siteConfig.clinicName;
  bookingLocationLabel.textContent = siteConfig.locationLabel;
  document.title = `${siteConfig.clinicName} | Fisioterapia y rehabilitación personalizada`;
}

function applyWhatsAppLinks() {
  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.contact.whatsappNumber,
    siteConfig.contact.whatsappDefaultMessage
  );

  [whatsappSidebarLink, whatsappExternalLink].forEach((element) => {
    if (!whatsappUrl) {
      element.hidden = true;
      element.removeAttribute("href");
      return;
    }

    element.hidden = false;
    element.href = whatsappUrl;
  });
}

function applyBookingMode() {
  const isExternalBooking =
    siteConfig.booking.mode === "external" && Boolean(siteConfig.booking.externalUrl);

  if (!isExternalBooking) {
    return;
  }

  form.hidden = true;
  confirmationCard.hidden = true;
  externalBookingPanel.hidden = false;
  externalBookingLink.href = siteConfig.booking.externalUrl;
  externalBookingLink.textContent = siteConfig.booking.externalLabel;
  externalBookingDescription.textContent =
    "Esta version queda lista para abrir una agenda externa con disponibilidad real y evitar doble reservacion.";
  bookingSectionCopy.textContent =
    "La agenda de esta pagina puede apuntar a Cal.com o Calendly. Cuando se configure esa URL, el flujo de reserva se hace en la agenda oficial y ya no depende de este formulario local.";
  headerCta.href = siteConfig.booking.externalUrl;
  primaryCta.href = siteConfig.booking.externalUrl;
  headerCta.target = "_blank";
  primaryCta.target = "_blank";
  headerCta.rel = "noopener";
  primaryCta.rel = "noopener";
  headerCta.textContent = siteConfig.booking.externalLabel;
  primaryCta.textContent = siteConfig.booking.externalLabel;
}

dateField.addEventListener("change", (event) => {
  renderTimeSlots(event.target.value);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!timeField.value) {
    renderEmptyState("Selecciona una hora antes de continuar.");
    return;
  }

  const formData = new FormData(form);
  const [year, month, day] = formData.get("date").split("-").map(Number);
  const [hours, minutes] = formData.get("time").split(":").map(Number);

  const start = new Date(year, month - 1, day, hours, minutes);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Number(siteConfig.booking.durationMinutes || 60));

  const service = formData.get("service");
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const phone = formData.get("phone").trim();
  const notes = formData.get("notes").trim() || "Sin notas adicionales.";
  const title = `${service} - ${name}`;
  const location = siteConfig.locationLabel;
  const description = [
    `Paciente: ${name}`,
    `Correo: ${email}`,
    `Telefono: ${phone}`,
    `Servicio: ${service}`,
    `Motivo de consulta: ${notes}`
  ].join("\n");

  releaseCurrentIcs();

  const icsFile = buildIcsFile({ title, description, location, start, end });
  currentIcsUrl = URL.createObjectURL(icsFile);
  icsDownload.href = currentIcsUrl;

  confirmationTitle.textContent = `${service} agendada`;
  confirmationDetails.textContent = `${formatReadableDate(formData.get("date"))} a las ${formData.get("time")} hrs.`;
  confirmationCard.hidden = false;

  const calendarUrl = buildCalendarUrl({ title, description, location, start, end });
  window.open(calendarUrl, "_blank", "noopener");
});

applyBranding();
applyWhatsAppLinks();
applyBookingMode();
initializeDateField();
window.addEventListener("beforeunload", releaseCurrentIcs);
