import { supabase } from '@/lib/supabase';

export const MCI_CONSORCIO_PRODUCT_KEY = 'mci_consorcio_imobiliario';

export async function syncMciConsorcioMemberAccess(
  memberId: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('set_partner_company_user_product_access', {
    p_member_id: memberId,
    p_product_key: MCI_CONSORCIO_PRODUCT_KEY,
    p_enabled: enabled,
  });

  if (error) {
    throw new Error(`Não foi possível sincronizar o acesso ao MCI Consórcio: ${error.message}`);
  }
}
