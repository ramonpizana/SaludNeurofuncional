const defaultScheduleByDay = {
  0: [],
  1: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  2: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  3: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  4: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  5: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  6: ["09:00", "10:30", "12:00"]
};

export function getSiteConfig() {
  const configuredSite = window.SN_SITE_CONFIG || {};
  const booking = {
    mode: "form",
    externalUrl: "",
    externalLabel: "Abrir agenda online",
    durationMinutes: 60,
    timezone: "America/Mexico_City",
    ...(configuredSite.booking || {})
  };
  const contact = {
    whatsappNumber: "",
    whatsappDefaultMessage: "Hola, quiero agendar una valoracion.",
    email: "",
    phoneDisplay: "",
    ...(configuredSite.contact || {})
  };

  return {
    clinicName: configuredSite.clinicName || "Salud Neurofuncional",
    shortName: configuredSite.shortName || "SN",
    tagline: configuredSite.tagline || "Fisioterapia personalizada",
    locationLabel: configuredSite.locationLabel || "Consultorio Salud Neurofuncional",
    booking,
    contact,
    scheduleByDay: {
      ...defaultScheduleByDay,
      ...(configuredSite.scheduleByDay || {})
    }
  };
}
