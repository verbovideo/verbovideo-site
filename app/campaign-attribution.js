const ATTRIBUTION_STORAGE_KEY = "verbovideo_campaign_attribution";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];

const ATTRIBUTION_LABELS = {
  utm_source: "Origem",
  utm_medium: "Canal",
  utm_campaign: "Campanha",
  utm_content: "Anúncio/criativo",
  utm_term: "Termo",
  fbclid: "Meta click ID",
  gclid: "Google click ID",
};

function sanitizeAttribution(value = {}) {
  return Object.fromEntries(
    ATTRIBUTION_KEYS.flatMap((key) => {
      const item = typeof value[key] === "string" ? value[key].trim() : "";
      return item ? [[key, item.slice(0, 300)]] : [];
    }),
  );
}

export function captureCampaignAttribution(
  targetWindow = typeof window === "undefined" ? undefined : window,
) {
  if (!targetWindow?.location) return {};

  let stored = {};
  try {
    stored = sanitizeAttribution(
      JSON.parse(targetWindow.sessionStorage?.getItem(ATTRIBUTION_STORAGE_KEY) || "{}"),
    );
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(targetWindow.location.search || "");
  const current = sanitizeAttribution(
    Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, params.get(key) || ""])),
  );
  const attribution = { ...stored, ...current };

  if (Object.keys(attribution).length > 0) {
    try {
      targetWindow.sessionStorage?.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify(attribution),
      );
    } catch {}
  }

  return attribution;
}

export function appendAttributionToMessage(message, attribution = {}) {
  const values = sanitizeAttribution(attribution);
  const lines = ATTRIBUTION_KEYS.flatMap((key) =>
    values[key] ? [`${ATTRIBUTION_LABELS[key]}: ${values[key]}.`] : [],
  );

  return lines.length > 0
    ? `${message}\n\nInformações da campanha:\n${lines.join("\n")}`
    : message;
}

export function buildWhatsAppUrl(number, message, attribution = {}) {
  return (
    `https://wa.me/${number}?text=` +
    encodeURIComponent(appendAttributionToMessage(message, attribution))
  );
}

export function preserveAttributionInHref(path, attribution = {}) {
  const url = new URL(path, "https://verbovideo.com.br");
  const values = sanitizeAttribution(attribution);

  for (const key of ATTRIBUTION_KEYS) {
    if (values[key]) url.searchParams.set(key, values[key]);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
