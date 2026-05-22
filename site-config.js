window.SN_SITE_CONFIG = {
  clinicName: "Salud Neurofuncional",
  shortName: "SN",
  tagline: "Fisioterapia personalizada",
  locationLabel: "Consultorio Salud Neurofuncional",
  contact: {
    whatsappNumber: "",
    whatsappMode: "redirect",
    whatsappRedirectPath: "/api/contact/whatsapp",
    whatsappDefaultMessage: "Hola, quiero agendar una valoracion en Salud Neurofuncional.",
    email: "",
    phoneDisplay: ""
  },
  booking: {
    mode: "external",
    externalUrl: "https://cal.com/ramon-pizana",
    externalLabel: "Reservar en linea",
    durationMinutes: 60,
    timezone: "America/Mexico_City"
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Aclara dudas comunes antes de reservar tu valoracion.",
    intro:
      "Una seccion breve para resolver objeciones frecuentes y abrir un contacto directo si la persona necesita orientacion antes de agendar.",
    ctaKicker: "Contacto directo",
    ctaTitle: "Tienes una duda sobre tu caso o el proceso de atencion?",
    ctaHelper:
      "Si prefieres confirmar si este servicio es para ti antes de reservar, escribe por WhatsApp y te orientamos.",
    ctaLabel: "Resolver mi duda por WhatsApp",
    ctaMessage: "Hola, tengo una duda antes de agendar una valoracion en Salud Neurofuncional.",
    ctaActions: [
      {
        label: "Quiero agendar",
        message: "Hola, quiero ayuda para agendar una valoracion en Salud Neurofuncional."
      },
      {
        label: "Necesito ubicacion",
        message: "Hola, me compartes la ubicacion del consultorio de Salud Neurofuncional?"
      },
      {
        label: "Tengo duda sobre costos",
        message: "Hola, tengo una duda sobre costos y proceso de atencion en Salud Neurofuncional."
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
  },
  scheduleByDay: {
    0: [],
    1: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
    2: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
    3: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
    4: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
    5: ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30"],
    6: ["09:00", "10:30", "12:00"]
  }
};
