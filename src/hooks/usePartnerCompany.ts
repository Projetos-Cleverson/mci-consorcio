import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PartnerCompany } from '@/types';

type PartnerState = {
  partnerCompany: PartnerCompany | null;
  loading: boolean;
  error: string | null;
};

const cache = new Map<string, PartnerCompany | null>();

export function getPartnerDisplayName(partner: PartnerCompany | null): string {
  return partner?.display_name || partner?.name || '';
}

export function getPartnerWhatsapp(partner: PartnerCompany | null, fallback = ''): string {
  return (partner?.commercial_whatsapp || fallback || '').replace(/\D/g, '');
}

export function usePartnerCompany(slug?: string | null): PartnerState {
  const normalizedSlug = useMemo(() => (slug || '').trim().toLowerCase(), [slug]);
  const [state, setState] = useState<PartnerState>({
    partnerCompany: null,
    loading: Boolean(normalizedSlug),
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function loadPartner() {
      if (!normalizedSlug || normalizedSlug === 'direto') {
        setState({ partnerCompany: null, loading: false, error: null });
        return;
      }

      if (cache.has(normalizedSlug)) {
        setState({ partnerCompany: cache.get(normalizedSlug) || null, loading: false, error: null });
        return;
      }

      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        const { data, error } = await supabase
          .from('partner_companies')
          .select('id,name,slug,display_name,logo_url,commercial_whatsapp,responsible_name,responsible_email,responsible_phone,city,state,primary_color,secondary_color,status')
          .eq('slug', normalizedSlug)
          .in('status', ['active', 'pilot'])
          .maybeSingle();

        if (error) throw error;

        cache.set(normalizedSlug, (data as PartnerCompany | null) || null);

        if (active) {
          setState({ partnerCompany: (data as PartnerCompany | null) || null, loading: false, error: null });
        }
      } catch (error) {
        console.error('Erro ao carregar empresa parceira:', error);
        if (active) {
          setState({
            partnerCompany: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Erro ao carregar empresa parceira.',
          });
        }
      }
    }

    loadPartner();

    return () => {
      active = false;
    };
  }, [normalizedSlug]);

  return state;
}
