export function serviceSlug(title: string) {
  const normalized = title.toLowerCase();
  if (/buy|purchas/.test(normalized)) return "buying";
  if (/sell|sale/.test(normalized)) return "selling";
  if (/rent|lease|tenant/.test(normalized)) return "renting";
  return normalized.trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

