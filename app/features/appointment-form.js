import {
  buildCalendarUrl,
  buildIcsFile,
  formatReadableDate
} from "../utils/calendar.js";

function toLocalDate(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

function getValidSlotsForDate(date, siteConfig) {
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

function getNextAvailableDate(siteConfig) {
  const today = new Date();

  for (let index = 0; index < 14; index += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + index);

    if (getValidSlotsForDate(candidate, siteConfig).length > 0) {
      return candidate;
    }
  }

  return today;
}

function updateSelectedSlot(dom, button) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    slot.classList.remove("selected");
  });

  button.classList.add("selected");
  dom.timeField.value = button.dataset.time;
}

function renderEmptyState(dom, message) {
  dom.timeSlots.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "time-empty";
  empty.textContent = message;
  dom.timeSlots.appendChild(empty);
}

function renderTimeSlots(dateString, siteConfig, dom) {
  dom.timeField.value = "";
  dom.timeSlots.innerHTML = "";

  if (!dateString) {
    renderEmptyState(dom, "Selecciona una fecha para ver horarios.");
    return;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const slots = siteConfig.scheduleByDay[selectedDate.getDay()] || [];

  if (slots.length === 0) {
    renderEmptyState(dom, "No hay horarios disponibles ese dia.");
    return;
  }

  const validSlots = getValidSlotsForDate(selectedDate, siteConfig);

  if (validSlots.length === 0) {
    renderEmptyState(dom, "Los horarios de hoy ya pasaron. Prueba con otra fecha.");
    return;
  }

  validSlots.forEach((slot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-slot";
    button.textContent = slot;
    button.dataset.time = slot;
    button.addEventListener("click", () => updateSelectedSlot(dom, button));
    dom.timeSlots.appendChild(button);

    if (index === 0) {
      updateSelectedSlot(dom, button);
    }
  });
}

function initializeDateField(siteConfig, dom) {
  const firstDate = getNextAvailableDate(siteConfig);
  const localDate = toLocalDate(firstDate);
  dom.dateField.min = toLocalDate(new Date());
  dom.dateField.value = localDate;
  renderTimeSlots(localDate, siteConfig, dom);
}

export function initializeAppointmentForm(siteConfig, dom) {
  let currentIcsUrl = "";

  function releaseCurrentIcs() {
    if (currentIcsUrl) {
      URL.revokeObjectURL(currentIcsUrl);
      currentIcsUrl = "";
    }
  }

  dom.dateField.addEventListener("change", (event) => {
    renderTimeSlots(event.target.value, siteConfig, dom);
  });

  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!dom.timeField.value) {
      renderEmptyState(dom, "Selecciona una hora antes de continuar.");
      return;
    }

    const formData = new FormData(dom.form);
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

    const icsFile = buildIcsFile({
      title,
      description,
      location,
      start,
      end,
      clinicName: siteConfig.clinicName
    });

    currentIcsUrl = URL.createObjectURL(icsFile);
    dom.icsDownload.href = currentIcsUrl;

    dom.confirmationTitle.textContent = `${service} agendada`;
    dom.confirmationDetails.textContent = `${formatReadableDate(formData.get("date"))} a las ${formData.get("time")} hrs.`;
    dom.confirmationCard.hidden = false;

    const calendarUrl = buildCalendarUrl({
      title,
      description,
      location,
      start,
      end,
      timezone:
        siteConfig.booking.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "America/Mexico_City"
    });

    window.open(calendarUrl, "_blank", "noopener");
  });

  initializeDateField(siteConfig, dom);
  window.addEventListener("beforeunload", releaseCurrentIcs);
}
