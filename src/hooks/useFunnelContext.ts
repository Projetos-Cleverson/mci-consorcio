import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildFunnelPath, captureTrackingContext } from '@/lib/tracking';

export function useFunnelContext(routePartnerSlug?: string | null) {
  const [searchParams] = useSearchParams();
  const serializedSearch = searchParams.toString();
  const partnerSlug = useMemo(
    () => (routePartnerSlug || new URLSearchParams(serializedSearch).get('partner') || 'direto').trim().toLowerCase(),
    [routePartnerSlug, serializedSearch],
  );

  useEffect(() => {
    captureTrackingContext(new URLSearchParams(serializedSearch), partnerSlug);
  }, [serializedSearch, partnerSlug]);

  const buildPath = useCallback(
    (path: string) => buildFunnelPath(path, new URLSearchParams(serializedSearch), partnerSlug),
    [serializedSearch, partnerSlug],
  );

  return { partnerSlug, buildPath };
}
