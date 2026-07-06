export const ATTRIBUTION_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
] as const;

export type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];
export type AttributionData = Partial<Record<AttributionParamKey, string>>;

function cleanParamValue(value: string | null) {
  const cleaned = (value || '').trim();
  return cleaned ? cleaned.slice(0, 500) : undefined;
}

export function getAttributionData(searchParams: URLSearchParams): AttributionData {
  return ATTRIBUTION_PARAM_KEYS.reduce<AttributionData>((acc, key) => {
    const value = cleanParamValue(searchParams.get(key));
    if (value) acc[key] = value;
    return acc;
  }, {});
}

export function hasAttribution(attribution?: AttributionData) {
  return Boolean(attribution && ATTRIBUTION_PARAM_KEYS.some((key) => attribution[key]));
}

export function appendAttributionParams(
  params: URLSearchParams,
  sourceSearchParams: URLSearchParams,
  partnerSlug?: string | null,
) {
  const normalizedPartner = cleanParamValue(partnerSlug || null);

  if (normalizedPartner && normalizedPartner !== 'direto') {
    params.set('partner', normalizedPartner);
  }

  ATTRIBUTION_PARAM_KEYS.forEach((key) => {
    const value = cleanParamValue(sourceSearchParams.get(key));
    if (value) params.set(key, value);
  });

  return params;
}

export function buildTrackedPath(
  path: string,
  sourceSearchParams: URLSearchParams,
  partnerSlug?: string | null,
) {
  const params = appendAttributionParams(new URLSearchParams(), sourceSearchParams, partnerSlug);
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function buildPartnerLandingPath(
  partnerSlug: string | null | undefined,
  sourceSearchParams: URLSearchParams,
) {
  const normalizedPartner = cleanParamValue(partnerSlug || null);

  if (!normalizedPartner || normalizedPartner === 'direto') {
    return buildTrackedPath('/', sourceSearchParams);
  }

  const params = appendAttributionParams(new URLSearchParams(), sourceSearchParams);
  const queryString = params.toString();
  return `/p/${encodeURIComponent(normalizedPartner)}${queryString ? `?${queryString}` : ''}`;
}
