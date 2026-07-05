export const TRACKING_STORAGE_KEY = 'mci_consorcio_attribution_v1';

export const TRACKING_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'gad_source',
  'campaignid',
  'adgroupid',
  'creative',
  'keyword',
  'device',
  'matchtype',
  'network',
] as const;

export type TrackingQueryKey = (typeof TRACKING_QUERY_KEYS)[number];

export interface TrackingContext {
  partner_slug: string;
  landing_url: string;
  referrer: string;
  captured_at: string;
  last_url: string;
  device_category: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  user_agent: string;
  params: Partial<Record<TrackingQueryKey, string>>;
}

function getDeviceCategory(): TrackingContext['device_category'] {
  if (typeof navigator === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent || '';
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function sanitizeValue(value: string | null): string | undefined {
  const normalized = (value || '').trim();
  return normalized ? normalized.slice(0, 500) : undefined;
}

export function readTrackingContext(): TrackingContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as TrackingContext;
  } catch {
    window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
    return null;
  }
}

export function captureTrackingContext(
  searchParams: URLSearchParams,
  partnerSlug?: string | null,
): TrackingContext {
  const existing = readTrackingContext();
  const normalizedPartner = (partnerSlug || searchParams.get('partner') || 'direto')
    .trim()
    .toLowerCase()
    .slice(0, 120) || 'direto';

  const currentUrl = typeof window !== 'undefined' ? window.location.href.slice(0, 2000) : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isLandingRoute = currentPath === '/' || currentPath.startsWith('/p/');
  const hasIncomingAttribution = TRACKING_QUERY_KEYS.some((key) => Boolean(sanitizeValue(searchParams.get(key))));
  const startsNewJourney = existing?.partner_slug !== normalizedPartner || (isLandingRoute && hasIncomingAttribution);
  const journeyBase = startsNewJourney ? null : existing;
  const params: Partial<Record<TrackingQueryKey, string>> = {
    ...(journeyBase?.params || {}),
  };

  TRACKING_QUERY_KEYS.forEach((key) => {
    const value = sanitizeValue(searchParams.get(key));
    if (value) params[key] = value;
  });

  const context: TrackingContext = {
    partner_slug: normalizedPartner,
    landing_url: journeyBase?.landing_url || currentUrl,
    referrer: journeyBase?.referrer || (typeof document !== 'undefined' ? document.referrer.slice(0, 2000) : ''),
    captured_at: journeyBase?.captured_at || new Date().toISOString(),
    last_url: currentUrl,
    device_category: journeyBase?.device_category || getDeviceCategory(),
    user_agent: journeyBase?.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 1000) : ''),
    params,
  };

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(context));
  }

  return context;
}

export function buildFunnelPath(
  path: string,
  searchParams: URLSearchParams,
  partnerSlug?: string | null,
): string {
  const nextParams = new URLSearchParams();
  const normalizedPartner = (partnerSlug || searchParams.get('partner') || '').trim().toLowerCase();

  const partnerAlreadyInPath = normalizedPartner && path.startsWith(`/p/${normalizedPartner}`);

  if (normalizedPartner && normalizedPartner !== 'direto' && !partnerAlreadyInPath) {
    nextParams.set('partner', normalizedPartner);
  }

  TRACKING_QUERY_KEYS.forEach((key) => {
    const value = sanitizeValue(searchParams.get(key));
    if (value) nextParams.set(key, value);
  });

  const query = nextParams.toString();
  return query ? `${path}?${query}` : path;
}

export function clearTrackingContext() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
  }
}
