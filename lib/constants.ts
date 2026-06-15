export const PIPELINE_STAGES = [
  {
    key: "DA_CONTATTARE",
    label: "Da contattare",
    color: "bg-gray-100 text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
    header: "bg-gray-50",
  },
  {
    key: "CONTATTATO",
    label: "Contattato",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    border: "border-blue-200",
    header: "bg-blue-50",
  },
  {
    key: "HA_RISPOSTO",
    label: "Ha risposto",
    color: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
    header: "bg-yellow-50",
  },
  {
    key: "MOCKUP_INVIATO",
    label: "Mockup inviato",
    color: "bg-purple-100 text-purple-700",
    dot: "bg-purple-400",
    border: "border-purple-200",
    header: "bg-purple-50",
  },
  {
    key: "PREVENTIVO",
    label: "PDF / Call / Preventivo",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    border: "border-green-200",
    header: "bg-green-50",
  },
] as const;

export type StageKey = (typeof PIPELINE_STAGES)[number]["key"];

export const POTENTIAL_OPTIONS = [
  { value: "ALTO", label: "Alto" },
  { value: "MEDIO", label: "Medio" },
  { value: "BASSO", label: "Basso" },
] as const;

export const WEBSITE_STATUS_OPTIONS = [
  { value: "ASSENTE", label: "Assente" },
  { value: "OBSOLETO", label: "Obsoleto" },
  { value: "BUONO", label: "Buono" },
] as const;

export const SOCIAL_STATUS_OPTIONS = [
  { value: "SCARSO", label: "Scarso" },
  { value: "MEDIO", label: "Medio" },
  { value: "BUONO", label: "Buono" },
] as const;

export const POTENTIAL_STYLES: Record<string, string> = {
  ALTO: "bg-green-100 text-green-700",
  MEDIO: "bg-yellow-100 text-yellow-700",
  BASSO: "bg-red-100 text-red-700",
};
