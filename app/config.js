const defaultScheduleByDay = {
  0: [],
  1: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  2: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  3: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  4: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  5: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
  6: ["09:00", "10:30", "12:00"]
};

const defaultFaq = {
  eyebrow: "Preguntas frecuentes",
  title: "Aclara dudas comunes antes de reservar tu valoracion.",
  intro:
    "Una seccion breve para resolver objeciones frecuentes y abrir un contacto directo si la persona necesita orientacion antes de agendar.",
  ctaKicker: "Contacto directo",
  ctaTitle: "Tienes una duda sobre tu caso o el proceso de atencion?",
  ctaHelper:
    "Si prefieres confirmar si este servicio es para ti antes de reservar, escribe por WhatsApp y te orientamos.",
  ctaLabel: "Resolver mi duda por WhatsApp",
  ctaMessage: "Hola, tengo una duda antes de agendar una valoracion.",
  ctaActions: [
    {
      label: "Quiero agendar",
      message: "Hola, quiero ayuda para agendar una valoracion."
    },
    {
      label: "Necesito ubicacion",
      message: "Hola, me compartes la ubicacion del consultorio?"
    },
    {
      label: "Tengo duda sobre costos",
      message: "Hola, tengo una duda sobre costos y proceso de atencion."
    }
  ],
  items: [
    {
      id: "valoracion-inicial",
      question: "Que incluye la valoracion inicial?",
      answer:
        "La primera sesion revisa tu motivo de consulta, antecedentes relevantes, movilidad, dolor, funcionalidad y objetivos para proponer una ruta terapeutica clara."
    },
    {
      id: "tipos-de-atencion",
      question: "Atiendes solo de forma presencial?",
      answer:
        "La base del sitio contempla atencion presencial y seguimiento online, para adaptar indicaciones, ejercicios y continuidad segun el caso."
    },
    {
      id: "duracion-frecuencia",
      question: "Cuanto dura una sesion y con que frecuencia suele recomendarse?",
      answer:
        "La valoracion inicial dura 60 minutos. La frecuencia posterior depende del objetivo funcional, la etapa de recuperacion y la respuesta al tratamiento."
    },
    {
      id: "cuando-escribir",
      question: "Cuando conviene escribir por WhatsApp antes de agendar?",
      answer:
        "Si no tienes claro si esta atencion aplica para tu caso, si necesitas confirmar modalidad o si quieres resolver una duda breve antes de reservar, el contacto por WhatsApp es el siguiente paso natural."
    }
  ]
};

function normalizeFaqItem(item, index) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const question = String(item.question || "").trim();
  const answer = String(item.answer || "").trim();

  if (!question || !answer) {
    return null;
  }

  const rawId = String(item.id || `faq-item-${index + 1}`).trim().toLowerCase();
  const id = rawId.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `faq-item-${index + 1}`;

  return {
    id,
    question,
    answer
  };
}

function normalizeFaqAction(item, index, fallbackMessage) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const label = String(item.label || "").trim();
  const message = String(item.message || fallbackMessage || "").trim();

  if (!label || !message) {
    return null;
  }

  return {
    id: `faq-action-${index + 1}`,
    label,
    message
  };
}

function getFaqConfig(configuredFaq) {
  const faqConfig = configuredFaq && typeof configuredFaq === "object" ? configuredFaq : {};
  const items = Array.isArray(faqConfig.items)
    ? faqConfig.items.map(normalizeFaqItem).filter(Boolean)
    : [];
  const ctaFallbackMessage = faqConfig.ctaMessage || defaultFaq.ctaMessage;
  const ctaActions = Array.isArray(faqConfig.ctaActions)
    ? faqConfig.ctaActions
        .map((item, index) => normalizeFaqAction(item, index, ctaFallbackMessage))
        .filter(Boolean)
    : [];

  return {
    eyebrow: faqConfig.eyebrow || defaultFaq.eyebrow,
    title: faqConfig.title || defaultFaq.title,
    intro: faqConfig.intro || defaultFaq.intro,
    ctaKicker: faqConfig.ctaKicker || defaultFaq.ctaKicker,
    ctaTitle: faqConfig.ctaTitle || defaultFaq.ctaTitle,
    ctaHelper: faqConfig.ctaHelper || defaultFaq.ctaHelper,
    ctaLabel: faqConfig.ctaLabel || defaultFaq.ctaLabel,
    ctaMessage: ctaFallbackMessage,
    ctaActions: ctaActions.length ? ctaActions : defaultFaq.ctaActions,
    items: items.length ? items : defaultFaq.items
  };
}

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
    whatsappMode: "direct",
    whatsappRedirectPath: "",
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
    faq: getFaqConfig(configuredSite.faq),
    scheduleByDay: {
      ...defaultScheduleByDay,
      ...(configuredSite.scheduleByDay || {})
    }
  };
}
