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
