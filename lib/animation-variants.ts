/**
 * Variações de animação pré-definidas para consistência
 * Essas animações são reutilizáveis em todo o site
 */

// Animações de entrada fade
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0.25, 0.75] as const, // ease-out suave
    },
  },
}

export const fadeInDown = {
  hidden: {
    opacity: 0,
    y: -60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0.25, 0.75] as const,
    },
  },
}

export const fadeInLeft = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0.25, 0.75] as const,
    },
  },
}

export const fadeInRight = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0.25, 0.75] as const,
    },
  },
}

// Animação de escala suave
export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.25, 0.25, 0.75] as const,
    },
  },
}

// Animações de hover para botões e cards
export const buttonHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
}

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -8,
    boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0.25, 0.75] as const,
    },
  },
}

// Animação de loading
export const loadingSpinner = {
  loading: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
  loaded: {
    rotate: 0,
    transition: {
      duration: 0.3,
    },
  },
}

// Animações em sequência para listas
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // delay entre cada item
      delayChildren: 0.2, // delay antes de começar
    },
  },
}

export const staggerItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

// Animação de slide para modais e sheets
export const slideInFromRight = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
}

export const slideInFromBottom = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
}

// Animação de backdrop para modais
export const backdropAnimation = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// Animação de pulsação para elementos que chamam atenção
export const pulse = {
  rest: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Animação de typing para texto
export const typewriter = {
  hidden: {
    width: 0,
  },
  visible: {
    width: "auto",
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
}