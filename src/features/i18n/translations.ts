export const translations = {
  es: {
    common: {
      open: "Abrir",
      openApp: "Abrir {app}",
      noAccess: "No tienes acceso a esta aplicación.",
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
      title: "Una familia de plataformas conectada",
      subtitle:
        "CoreTX conecta las plataformas, los sistemas de gestión, los datos y los agentes de IA de TRAXION para coordinar logística, transporte, brokerage y movilidad.",
    },
    categories: {
      logistics: "Logística y tecnología",
      cargoPeople: "Carga y personas",
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
      connect: {
        name: "CoreTX Connect",
        description: "Digitalización de Servicios Corporativos.",
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
      openApp: "Open {app}",
      noAccess: "You don't have access to this application.",
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
      title: "A connected family of platforms",
      subtitle:
        "CoreTX connects TRAXION's platforms, management systems, data and AI agents to coordinate logistics, transport, brokerage and mobility.",
    },
    categories: {
      logistics: "Logistics and technology",
      cargoPeople: "Cargo and people",
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
      connect: {
        name: "CoreTX Connect",
        description: "Digitalisation of corporate services.",
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
