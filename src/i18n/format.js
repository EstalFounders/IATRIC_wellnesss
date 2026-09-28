/**
 * Tiny interpolation helper for translated strings.
 *
 *   fmt("{n} Patient Stories", { n: 12 })  ->  "12 Patient Stories"
 *   fmt("{exp} experience overall", { exp: "8 years" })
 *
 * Unknown placeholders are left untouched and missing vars render as "".
 */
export function fmt(template, vars = {}) {
  if (template === undefined || template === null) return template;
  return Object.keys(vars).reduce(
    (acc, key) => acc.split(`{${key}}`).join(String(vars[key] === undefined || vars[key] === null ? "" : vars[key])),
    String(template)
  );
}

export default fmt;
