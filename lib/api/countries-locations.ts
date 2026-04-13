import { LOCATIONS_API_COUNTRY_NAME } from "@/lib/constants/locations";

const BASE = "https://countriesnow.space/api/v0.1";

export type CountryStateRow = { name: string; state_code: string };

type StatesResponse = {
  error: boolean;
  msg?: string;
  data?: { states?: CountryStateRow[] };
};

type CitiesResponse = {
  error: boolean;
  msg?: string;
  data?: string[];
};

function assertOk(res: Response, action: string) {
  if (!res.ok) throw new Error(`${action} (${res.status})`);
}

/**
 * Lists states for a country. Uses GET `/countries/states/q` (POST to `/states` redirects).
 */
export async function fetchCountryStates(
  countryName: string = LOCATIONS_API_COUNTRY_NAME,
): Promise<CountryStateRow[]> {
  const url = `${BASE}/countries/states/q?country=${encodeURIComponent(countryName)}`;
  const res = await fetch(url);
  assertOk(res, "Failed to load states");
  const json = (await res.json()) as StatesResponse;
  if (json.error) throw new Error(json.msg ?? "Failed to load states");
  const states = json.data?.states;
  if (!Array.isArray(states)) throw new Error("Invalid states response");
  return states.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Cities or LGAs for a state. Uses GET `/countries/state/cities/q` (POST redirects).
 */
export async function fetchStateCities(
  stateName: string,
  countryName: string = LOCATIONS_API_COUNTRY_NAME,
): Promise<string[]> {
  const url = `${BASE}/countries/state/cities/q?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`;
  const res = await fetch(url);
  assertOk(res, "Failed to load cities");
  const json = (await res.json()) as CitiesResponse;
  if (json.error) throw new Error(json.msg ?? "Failed to load cities");
  const list = json.data;
  if (!Array.isArray(list)) throw new Error("Invalid cities response");
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const c of list) {
    const k = c.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(c);
    }
  }
  return unique.sort((a, b) => a.localeCompare(b));
}
