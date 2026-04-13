/**
 * Nigeria mobile: E.164 +234 + 10 national digits (no leading 0).
 * User types the national part only; UI shows +234.
 */

const NG_CC = "234";

/** Strip to digits only, handle pasted full numbers or local 0-prefix. */
export function normalizeNationalDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith(NG_CC) && d.length >= 13) {
    d = d.slice(NG_CC.length);
  }
  if (d.startsWith("0") && d.length >= 11) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
}

export function toE164Nigeria(national10: string): string {
  const d = normalizeNationalDigits(national10);
  if (d.length !== 10) return "";
  return `+${NG_CC}${d}`;
}

export function isValidNgMobileNational(digits: string): boolean {
  const d = normalizeNationalDigits(digits);
  if (d.length !== 10) return false;
  const first = d[0];
  return first === "7" || first === "8" || first === "9";
}
