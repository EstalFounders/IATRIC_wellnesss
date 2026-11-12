import React from "react";

// Custom medical icons for the header navigation (Services mega-menu + the
// mobile drawer). They are stroke-only and paint with `currentColor`, so the
// brand green comes from CSS (`color: var(--color-primary)`) and the same icons
// work on the white desktop menu and on the light mobile drawer.
// 24x24 grid, 1.6 stroke - sized by the caller (see `.nav-service-icon`).
const NavIcon = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

export const NursingNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="7.4" r="3.1" />
    <path d="M5.4 20.6v-1.9a4.7 4.7 0 0 1 4.7-4.7h3.8a4.7 4.7 0 0 1 4.7 4.7v1.9" />
    <path d="M12 14.6v3.6M10.2 16.4h3.6" />
  </NavIcon>
);

export const PhysiotherapyNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="4.6" r="2.1" />
    <path d="M12 6.7v6.4" />
    <path d="M12 9.1 7.7 5.3M12 9.1l4.3-3.8" />
    <path d="M12 13.1 9.1 20.4M12 13.1l2.9 7.3" />
  </NavIcon>
);

export const DiagnosticTestNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M9.2 3.2h5.6" />
    <path d="M10.4 3.2v6.1L6.7 17a2.4 2.4 0 0 0 2.1 3.5h6.4a2.4 2.4 0 0 0 2.1-3.5l-3.7-7.7V3.2" />
    <path d="M7.7 14.6h8.6" />
  </NavIcon>
);

export const AmbulanceNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M2.8 17.2V8.2h8.4v9" />
    <path d="M11.2 11.2h3.9l3.1 3.1v2.9" />
    <path d="M4.2 17.2h.6M9 17.2h5.2M17.6 17.2h3.6" />
    <circle cx="6.6" cy="17.7" r="1.7" />
    <circle cx="15.8" cy="17.7" r="1.7" />
    <path d="M6.9 10.5v3M5.4 12h3" />
  </NavIcon>
);

export const NutritionNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M12 8.7c-1.6-1.6-4.1-1.7-5.5.3-1.6 2.3-1 5.9 1 8.1 1.1 1.3 2.5 1.6 3.4 1 .7-.5 1.5-.5 2.2 0 .9.6 2.3.3 3.4-1 2-2.2 2.6-5.8 1-8.1-1.4-2-3.9-1.9-5.5-.3Z" />
    <path d="M12 8.7c0-1.7.7-3.1 2.2-4" />
  </NavIcon>
);

export const MedicineNavIcon = (props) => (
  <NavIcon {...props}>
    <rect x="3.2" y="9" width="17.6" height="6" rx="3" />
    <path d="M12 9v6" />
  </NavIcon>
);

export const XRayNavIcon = (props) => (
  <NavIcon {...props}>
    <rect x="4.2" y="3.2" width="15.6" height="17.6" rx="2" />
    <path d="M12 6.6v11M9 8.6h6M9 12h6M9 15.6h6" />
  </NavIcon>
);

export const IcuCareNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M4.2 20.6V10.4L12 3.6l7.8 6.8v10.2" />
    <path d="M2.8 20.6h18.4" />
    <path d="M12 11.4v4.4M9.9 13.6h4.2" />
  </NavIcon>
);

export const CardiacCareNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M12 20.3S4.7 15.8 4.7 10.7a3.9 3.9 0 0 1 7.3-2 3.9 3.9 0 0 1 7.3 2c0 5.1-7.3 9.6-7.3 9.6Z" />
    <path d="M6.9 12.4h2.4l1.2-2.3 1.7 4.1 1.2-2.4h2.3" />
  </NavIcon>
);

export const MedicalAttendantNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="8.9" cy="6.4" r="2.4" />
    <path d="M4.4 20.4V18a4.3 4.3 0 0 1 4.3-4.3h.9a4.3 4.3 0 0 1 4.3 4.3v2.4" />
    <rect x="15.2" y="12.6" width="5.4" height="5.4" rx="1.2" />
    <path d="M16.8 12.6v-1.2a1.7 1.7 0 0 1 3.4 0v1.2" />
  </NavIcon>
);

export const ElderCareNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="9.7" cy="5.4" r="2.2" />
    <path d="M8.9 7.6 7.3 14.4l1.3 5.6" />
    <path d="M8.7 9.6l4.4 2.9" />
    <path d="M16.9 20.4V6.6M14.9 6.6h2.4" />
  </NavIcon>
);

export const VaccinationNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M16.9 3.4 20.6 7.1" />
    <path d="M14.5 6.1 17.9 9.5" />
    <path d="M15.7 4.9 6.5 14.1 4.9 19.5l5.4-1.6 9.2-9.2" />
    <path d="M9.3 11.3 12.7 14.7" />
  </NavIcon>
);

export const DoctorConsultationNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="6.4" r="2.9" />
    <path d="M5.6 20.6V18a5.4 5.4 0 0 1 10.8 0v2.6" />
    <path d="M9.4 12.1v2.7a2.6 2.6 0 0 0 5.2 0v-2.7" />
    <circle cx="14.6" cy="15.4" r="1.2" />
  </NavIcon>
);

export const EcgNavIcon = (props) => (
  <NavIcon {...props}>
    <rect x="2.6" y="4.2" width="18.8" height="12.2" rx="2" />
    <path d="M5.4 11.2h2.8l1.5-3.2 2.6 6 1.9-4 1.4 1.2h2.6" />
    <path d="M12 16.4v3.4M8.6 19.8h6.8" />
  </NavIcon>
);

export const CorporateWellnessNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="6" r="2.6" />
    <path d="M6.4 20.6V18a5.6 5.6 0 0 1 11.2 0v2.6" />
    <path d="M10.4 12.9 12 14.4l1.6-1.5M12 14.4v3.4" />
  </NavIcon>
);

export const MedicalEquipmentNavIcon = (props) => (
  <NavIcon {...props}>
    <rect x="3" y="6.6" width="18" height="12" rx="2" />
    <path d="M9.2 6.6V3.6h5.6v3" />
    <path d="M6.2 10.6h4.6M6.2 14.2h3" />
    <circle cx="16.6" cy="11.6" r="1.5" />
    <path d="M15.1 14.4h3" />
  </NavIcon>
);

export const HomeCareNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M3.8 10.6 12 3.6l8.2 7v9.8H3.8z" />
    <path d="M12 11.4v5.2M9.5 14h5" />
  </NavIcon>
);

export const CommunityCareNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="6" r="2.4" />
    <path d="M7.4 20.4v-1.8a4.6 4.6 0 0 1 9.2 0v1.8" />
    <circle cx="4.9" cy="10.4" r="1.7" />
    <path d="M1.9 19.4v-1.2a3 3 0 0 1 3-3" />
    <circle cx="19.1" cy="10.4" r="1.7" />
    <path d="M22.1 19.4v-1.2a3 3 0 0 0-3-3" />
  </NavIcon>
);

export const PediatricsNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="12" cy="6.6" r="3" />
    <path d="M6.6 20.4v-1.6a5.4 5.4 0 0 1 10.8 0v1.6" />
    <circle cx="12" cy="9.1" r="0.9" />
  </NavIcon>
);

export const DermatologyNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M9.4 4c2 2.6 3.4 4.5 3.4 6.4a3.4 3.4 0 1 1-6.8 0c0-1.9 1.4-3.8 3.4-6.4Z" />
    <path d="M17.6 13.2l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
  </NavIcon>
);

export const OrthopaedicsNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M8.7 15.3 15.3 8.7" />
    <circle cx="6.9" cy="13.5" r="2.1" />
    <circle cx="10.5" cy="17.1" r="2.1" />
    <circle cx="13.5" cy="6.9" r="2.1" />
    <circle cx="17.1" cy="10.5" r="2.1" />
  </NavIcon>
);

export const GynaecologyNavIcon = (props) => (
  <NavIcon {...props}>
    <circle cx="10.6" cy="4.6" r="2.2" />
    <path d="M10.6 6.8v4.4" />
    <path d="M10.6 11.2a4 4 0 0 0-1.6 3.2c0 2 .9 3.9 1.6 5.2" />
    <path d="M10.6 11.2a4.2 4.2 0 0 1 4.2 4.2c0 1.8-1.4 3.4-4.2 4.6" />
  </NavIcon>
);

export const OphthalmologyNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M2.4 12S5.6 6.4 12 6.4 21.6 12 21.6 12 18.4 17.6 12 17.6 2.4 12 2.4 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </NavIcon>
);

export const PulmonologyNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M12 3.6v7" />
    <path d="M12 8.2 8.2 7.2c-1.8-.4-3.1 1-3.1 2.8v4.4c0 2 1.2 3.6 3.2 3.6h1.5c1.2 0 2.2-1 2.2-2.2V8.2" />
    <path d="M12 8.2l3.8-1c1.8-.4 3.1 1 3.1 2.8v4.4c0 2-1.2 3.6-3.2 3.6h-1.5c-1.2 0-2.2-1-2.2-2.2V8.2" />
  </NavIcon>
);

export const PsychiatryNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M15.8 20.4v-2.2a6 6 0 1 0-8.9-5.4c0 .9.2 1.7.6 2.4L6.1 18.6h3.3" />
    <path d="M10.6 9.3c1.6-1.2 3.4-.3 3.4 1.1 0 1.4-2 1.4-2 2.8 0 .9.7 1.4 1.6 1.4" />
  </NavIcon>
);

export const DentistryNavIcon = (props) => (
  <NavIcon {...props}>
    <path d="M7.2 3.6c1.6 0 2.6 1 4.8 1s3.2-1 4.8-1c2.2 0 3 2.2 2.4 5.3-.4 2.1-.9 3.2-1.3 5.5-.4 2.4-.7 4.5-2 4.5-1.3 0-1.3-2.6-1.9-4.5-.3-1-.9-1.6-2-1.6s-1.7.6-2 1.6c-.6 1.9-.6 4.5-1.9 4.5-1.3 0-1.6-2.1-2-4.5-.4-2.3-.9-3.4-1.3-5.5C4.2 5.8 5 3.6 7.2 3.6Z" />
  </NavIcon>
);

// Fallback for anything the keyword map does not know (new DB services and
// specialities should still show a medical mark instead of an empty slot).
export const SpecialityNavIcon = (props) => (
  <NavIcon {...props}>
    <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.2" />
    <path d="M12 8.3v7.4M8.3 12h7.4" />
  </NavIcon>
);

// Keyword -> icon map. DB names arrive with punctuation, "&" and runs of spaces
// ("Nursing Care", "Nutrition & Diet", "ECG"), so the label is normalised to
// plain lower-case words first and matched with word boundaries. Order matters:
// the specific services (ICU, ECG, X-Ray, ...) sit above the generic ones, and
// every rule is checked before falling back to SpecialityNavIcon.
const ICON_RULES = [
  { pattern: /\b(ambulance|ems|emergency transport)\b/, icon: AmbulanceNavIcon },
  {
    pattern: /\b(medicine\w*|pharmac\w*|pill\w*|tablet\w*|drug\w*|delivery)\b/,
    icon: MedicineNavIcon,
  },
  { pattern: /\b(icu|intensive care|critical care|ventilator)\b/, icon: IcuCareNavIcon },
  { pattern: /\b(ecg|ekg|electrocardiogram)\b/, icon: EcgNavIcon },
  {
    pattern: /\b(x ray|radiology|radiologist|imaging|sonography|ultrasound)\b/,
    icon: XRayNavIcon,
  },
  {
    pattern: /\b(vaccin\w*|immunis\w*|immuniz\w*|syringe|injection)\b/,
    icon: VaccinationNavIcon,
  },
  {
    pattern: /\b(physio\w*|rehab\w*|chiropract\w*)\b/,
    icon: PhysiotherapyNavIcon,
  },
  { pattern: /\b(nutrition\w*|diet\w*)\b/, icon: NutritionNavIcon },
  { pattern: /\b(cardio\w*|cardiac|heart)\b/, icon: CardiacCareNavIcon },
  {
    pattern: /\b(elder\w*|geriatric\w*|senior citizen\w*)\b/,
    icon: ElderCareNavIcon,
  },
  {
    pattern: /\b(attendant\w*|gda|care ?taker\w*|nursing assistant)\b/,
    icon: MedicalAttendantNavIcon,
  },
  { pattern: /\b(nurs\w*)\b/, icon: NursingNavIcon },
  {
    pattern: /\b(diagnostic\w*|pathology|laborator\w*|lab|blood test\w*)\b/,
    icon: DiagnosticTestNavIcon,
  },
  {
    pattern: /\b(equipment\w*|device\w*|oxygen|wheelchair|hospital bed|monitor\w*)\b/,
    icon: MedicalEquipmentNavIcon,
  },
  {
    pattern: /\b(corporate|employee\w*|occupational|workplace|wellness|ohc)\b/,
    icon: CorporateWellnessNavIcon,
  },
  { pattern: /\b(home ?care|home ?visit\w*|home nursing)\b/, icon: HomeCareNavIcon },
  {
    pattern: /\b(communit\w*|health ?camp\w*|camp\w*|outreach|school\w*|awareness)\b/,
    icon: CommunityCareNavIcon,
  },
  { pattern: /\b(pa?ediatric\w*|child\w*|kids?)\b/, icon: PediatricsNavIcon },
  { pattern: /\b(dermat\w*|skin|cosmetolog\w*)\b/, icon: DermatologyNavIcon },
  {
    pattern: /\b(ortho\w*|bone\w*|joint\w*|spine|spinal|fracture\w*)\b/,
    icon: OrthopaedicsNavIcon,
  },
  {
    pattern: /\b(gynae\w*|gyneco\w*|obstetric\w*|pregnan\w*|maternity)\b/,
    icon: GynaecologyNavIcon,
  },
  {
    pattern: /\b(ophthalmolog\w*|eye\w*|vision|optic\w*)\b/,
    icon: OphthalmologyNavIcon,
  },
  {
    pattern: /\b(pulmonolog\w*|lung\w*|respirat\w*|asthma|copd)\b/,
    icon: PulmonologyNavIcon,
  },
  {
    pattern: /\b(psych\w*|mental health|depress\w*|anxiety|counsel\w*)\b/,
    icon: PsychiatryNavIcon,
  },
  {
    pattern: /\b(dentist\w*|dental|tooth|teeth|orthodont\w*)\b/,
    icon: DentistryNavIcon,
  },
  {
    pattern: /\b(doctor\w*|physician|consult\w*|general medicine|internal medicine)\b/,
    icon: DoctorConsultationNavIcon,
  },
];

const normalizeLabel = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Returns the icon component for a service/speciality label. Always renders
// something (SpecialityNavIcon) so a brand-new DB entry never leaves a gap.
export const resolveNavServiceIcon = (name) => {
  const label = normalizeLabel(name);
  if (!label) return SpecialityNavIcon;
  const rule = ICON_RULES.find(({ pattern }) => pattern.test(label));
  return rule ? rule.icon : SpecialityNavIcon;
};
