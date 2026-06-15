export const PIPELINE_STAGES = [
  {
    key: "DA_CONTATTARE",
    label: "Da contattare",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
    border: "border-gray-200",
    header: "bg-gray-50",
  },
  {
    key: "CONTATTATO",
    label: "Contattato",
    color: "bg-blue-50 text-blue-600",
    dot: "bg-blue-400",
    border: "border-blue-100",
    header: "bg-blue-50/60",
  },
  {
    key: "HA_RISPOSTO",
    label: "Ha risposto",
    color: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
    border: "border-amber-100",
    header: "bg-amber-50/60",
  },
  {
    key: "MOCKUP_INVIATO",
    label: "Mockup inviato",
    color: "bg-violet-50 text-violet-600",
    dot: "bg-violet-400",
    border: "border-violet-100",
    header: "bg-violet-50/60",
  },
  {
    key: "PREVENTIVO",
    label: "PDF / Call / Preventivo",
    color: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
    border: "border-emerald-100",
    header: "bg-emerald-50/60",
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
  ALTO: "bg-emerald-50 text-emerald-700",
  MEDIO: "bg-amber-50 text-amber-700",
  BASSO: "bg-red-50 text-red-600",
};
