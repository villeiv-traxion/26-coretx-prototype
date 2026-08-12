export const translations = {
  es: {
    common: {
      open: "Abrir",
      language: "Idioma",
      languageEn: "Inglés",
      languageEs: "Español",
    },
    header: {
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      panelTitle: "Aplicaciones y servicios",
      panelDescription:
        "Todas las apps y ejes transversales disponibles en CoreTX.",
    },
    home: {
      title: "Una plataforma para toda Traxion.",
      subtitle:
        "Las aplicaciones especializadas de cada división y los ejes transversales, en un solo lugar.",
    },
    categories: {
      logistics: "Logística y tecnología",
      cargo: "Carga",
      people: "Personas",
      transversal: "Transversales",
    },
    apps: {
      logistics: {
        name: "CoreTX Logistics",
        description: "Gestión Integral de Operaciones Logísticas.",
      },
      one: {
        name: "CoreTX One",
        description: "Brokerage Cross-Border, Intra-MX e Intra-USA.",
      },
      fleet: {
        name: "CoreTX Fleet",
        description: "Gestión integral de la División Carga.",
      },
      mind: {
        name: "CoreTX MIND",
        description: "Gestión integral de la División Personas.",
      },
      intelligence: {
        name: "CoreTX Intelligence",
        description: "Sistemas de Gestión, Datos y Decisión.",
      },
      navigate: {
        name: "CoreTX Navigate",
        description: "Ejecución Comercial Corporativa.",
      },
    },
    footer: {
      copyright: "© {year} Traxion. Todos los derechos reservados.",
      privacy: "Política de privacidad",
      terms: "Términos de uso",
    },
    chat: {
      title: "Traxion IA",
      subtitle: "Asistente IA",
      triggerLabel: "Abrir asistente IA",
      placeholder: "Pregúntame lo que sea...",
      initialMessage: "¡Hola! 👋 Soy Traxion IA. ¿En qué puedo ayudarte?",
      response: "Esto es solo una demo — esta funcionalidad aún no está lista.",
      today: "Hoy",
    },
  },
  en: {
    common: {
      open: "Open",
      language: "Language",
      languageEn: "English",
      languageEs: "Spanish",
    },
    header: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      panelTitle: "Applications and services",
      panelDescription: "Every app and cross-cutting axis available in CoreTX.",
    },
    home: {
      title: "One platform for all of Traxion.",
      subtitle:
        "Each division's specialized applications and the cross-cutting axes, all in one place.",
    },
    categories: {
      logistics: "Logistics and technology",
      cargo: "Cargo",
      people: "People",
      transversal: "Cross-cutting",
    },
    apps: {
      logistics: {
        name: "CoreTX Logistics",
        description: "End-to-end management of logistics operations.",
      },
      one: {
        name: "CoreTX One",
        description: "Cross-Border, Intra-MX and Intra-USA brokerage.",
      },
      fleet: {
        name: "CoreTX Fleet",
        description: "End-to-end management of the Cargo division.",
      },
      mind: {
        name: "CoreTX MIND",
        description: "End-to-end management of the People division.",
      },
      intelligence: {
        name: "CoreTX Intelligence",
        description: "Management systems, data and decision-making.",
      },
      navigate: {
        name: "CoreTX Navigate",
        description: "Corporate commercial execution.",
      },
    },
    footer: {
      copyright: "© {year} Traxion. All rights reserved.",
      privacy: "Privacy policy",
      terms: "Terms of use",
    },
    chat: {
      title: "Traxion AI",
      subtitle: "AI Assistant",
      triggerLabel: "Open AI assistant",
      placeholder: "Ask me anything...",
      initialMessage: "Hi there! 👋 I'm Traxion AI. How can I help you?",
      response: "This is just a demo — this functionality is not ready yet.",
      today: "Today",
    },
  },
} as const;

export type Language = keyof typeof translations;
export type Translations = (typeof translations)[Language];
