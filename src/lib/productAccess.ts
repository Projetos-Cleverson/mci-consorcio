import { supabase } from '@/lib/supabase';

export type ProductPermissionRole =
  | 'master_admin'
  | 'admin_produto'
  | 'empresa_admin'
  | 'gestor'
  | 'consultor';

export type ProductPermission = {
  id: string;
  product_key: string;
  user_id: string;
  company_id: string | null;
  role: ProductPermissionRole;
  status: 'active' | 'inactive' | 'suspended';
};

export async function getProductPermission(productKey: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('product_user_permissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_key', productKey)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProductPermission | null;
}