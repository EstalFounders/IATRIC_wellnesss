import {
  ENTIcon,
  NeurologyIcon,
  NutritionistDietitianIcon,
} from "../../../public/svgIcon/all-department-svg-icon";

// Key used for the per-component `ICON_BY_NAME` maps. DB names arrive with runs
// of spaces ("Neurology       (Brain & Spine)"), so they are collapsed first or
// the exact key never matches.
export const normalizeDepartmentName = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Fully normalised form used for keyword matching: punctuation disappears and
// "&" becomes "and" so "Dietitian & Nutritionist" / "Dietitian and Nutritionist"
// / "E.N.T" all end up as plain words.
const normalize = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Specialities the shared map in Demo5Services1/2 does not know about yet.
// Word boundaries are essential: a bare `includes("ent")` would also swallow
// Dentistry, Mental Health and Gastroenterology, and `includes("diet")` would
// hit "Dietician" only by accident.
const KEYWORD_RULES = [
  {
    pattern:
      /\b(ent|e n t|ear|ears|hearing|otolaryngology|otolaryngologist|laryngology|throat)\b/,
    icon: ENTIcon,
  },
  {
    pattern:
      /\b(neurology|neurologist|neurological|neurosurgery|neuroscience|neuro|brain|brains|spine|spinal)\b/,
    icon: NeurologyIcon,
  },
  {
    pattern:
      /\b(dietitian|dietician|nutritionist|nutrition|nutritional|dietetics|diet)\b/,
    icon: NutritionistDietitianIcon,
  },
];

// Returns the matching icon component, or `null` when the name is not one of the
// three departments handled here (the caller then keeps its own default icon).
export const resolveDepartmentIcon = (name) => {
  const key = normalize(name);
  if (!key) return null;
  const rule = KEYWORD_RULES.find(({ pattern }) => pattern.test(key));
  return rule ? rule.icon : null;
};
