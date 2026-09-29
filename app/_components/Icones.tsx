import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = (props: Props) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconePix = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 18 9-5 9 5" />
  </svg>
);

export const IconeCodigoBarras = (p: Props) => (
  <svg {...base(p)}>
    <path d="M3 6v12M7 6v12M10 6v12M14 6v12M17 6v12M21 6v12" />
  </svg>
);

export const IconeSacoDinheiro = (p: Props) => (
  <svg {...base(p)}>
    <path d="M9 3h6l-1 3c1.7.7 3 1.6 4 3l-4 2-2 3-2-3-4-2c1-1.4 2.3-2.3 4-3L9 3Z" />
    <path d="M10 13h4v3a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-3Z" />
    <path d="M12 14v2" />
  </svg>
);

export const IconeTransferir = (p: Props) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M12 13v7" />
    <path d="m9 17 3 3 3-3" />
  </svg>
);

export const IconeCelular = (p: Props) => (
  <svg {...base(p)}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);

export const IconeCartao = (p: Props) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20" />
  </svg>
);

export const IconeSeta = (p: Props) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconeSubirDescer = (p: Props) => (
  <svg {...base(p)}>
    <path d="M8 20V7M8 7 4.5 10.5M8 7l3.5 3.5" />
    <path d="M16 4v13M16 17l-3.5-3.5M16 17l3.5-3.5" />
  </svg>
);

export const IconeDolar = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 2v20" />
    <path d="M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.6 5 3.2 5 1.3 5 3.3-2.2 3-5 3-5-1.1-5-3" />
  </svg>
);

export const IconeCadeado = (p: Props) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconeSino = (p: Props) => (
  <svg {...base(p)}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
    <path d="M10.5 20a2 2 0 0 0 3 0" />
  </svg>
);

export const IconeRaio = (p: Props) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const IconeOlho = (p: Props) => (
  <svg {...base(p)}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconeSair = (p: Props) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
