import { createClient } from '@supabase/supabase-js';

type RequestBody = {
  memberId: string;
  action?: 'create_login' | 'reset_password';
  temporaryPassword?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

function normalizeRole(role?: string | null) {
  if (!role) return 'unknown';

  if (['admin', 'master_admin', 'admin_epsa', 'matriz', 'owner'].includes(role)) {
    return 'master';
  }

  if (['company_admin', 'partner_admin', 'empresa_parceira', 'contratante'].includes(role)) {
    return 'company';
  }

  if (['company_manager', 'manager', 'gestor'].includes(role)) {
    return 'manager';
  }

  if (['company_consultant', 'consultant', 'consultor'].includes(role)) {
    return 'consultant';
  }

  return 'unknown';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ ok: true });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Variáveis de ambiente do Supabase ausentes.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: callerData, error: callerError } = await userClient.auth.getUser();

    if (callerError || !callerData.user) {
      return jsonResponse({ error: 'Usuário não autenticado.' }, 401);
    }

    const callerUserId = callerData.user.id;

    const body = (await req.json()) as RequestBody;

    if (!body.memberId) {
      return jsonResponse({ error: 'memberId é obrigatório.' }, 400);
    }

    const action = body.action || 'create_login';

    const { data: member, error: memberError } = await adminClient
      .from('partner_company_users')
      .select('id,company_id,user_id,name,email,phone,role,status')
      .eq('id', body.memberId)
      .maybeSingle();

    if (memberError) {
      return jsonResponse({ error: memberError.message }, 500);
    }

    if (!member) {
      return jsonResponse({ error: 'Membro da equipe não encontrado.' }, 404);
    }

    if (!member.email) {
      return jsonResponse({ error: 'Este membro não possui e-mail cadastrado.' }, 400);
    }

    if (action === 'create_login' && member.user_id) {
      return jsonResponse({ error: 'Este membro já possui login vinculado. Use a opção de gerar nova senha.' }, 400);
    }

    if (action === 'reset_password' && !member.user_id) {
      return jsonResponse({ error: 'Este membro ainda não possui user_id vinculado.' }, 400);
    }

    const { data: adminProfile } = await adminClient
      .from('mci_admin_users')
      .select('role,status')
      .eq('user_id', callerUserId)
      .eq('status', 'active')
      .maybeSingle();

    let callerRole = normalizeRole(adminProfile?.role);
    let callerCompanyId: string | null = null;

    if (callerRole !== 'master') {
      const { data: companyUser } = await adminClient
        .from('partner_company_users')
        .select('role,status,company_id')
        .eq('user_id', callerUserId)
        .eq('status', 'active')
        .maybeSingle();

      callerRole = normalizeRole(companyUser?.role);
      callerCompanyId = companyUser?.company_id || null;
    }

    const canCreate =
      callerRole === 'master'
      || ((callerRole === 'company' || callerRole === 'manager') && callerCompanyId === member.company_id);

    if (!canCreate) {
      return jsonResponse({ error: 'Você não tem permissão para criar login para este usuário.' }, 403);
    }

    if (callerRole === 'manager' && member.role !== 'company_consultant') {
      return jsonResponse({ error: 'Gestores só podem criar login para consultores.' }, 403);
    }

    const temporaryPassword = body.temporaryPassword?.trim() || generatePassword();

    if (action === 'reset_password') {
      const { data: updatedUser, error: updateUserError } = await adminClient.auth.admin.updateUserById(
        member.user_id,
        {
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            name: member.name || member.email,
            phone: member.phone || null,
            company_id: member.company_id,
            role: member.role,
          },
        },
      );

      if (updateUserError) {
        return jsonResponse({ error: updateUserError.message }, 400);
      }

      return jsonResponse({
        success: true,
        action: 'reset_password',
        userId: updatedUser.user?.id || member.user_id,
        email: member.email,
        temporaryPassword,
        message: 'Senha temporária gerada com sucesso.',
      });
    }

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: member.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: member.name || member.email,
        phone: member.phone || null,
        company_id: member.company_id,
        role: member.role,
      },
    });

    if (createUserError) {
      return jsonResponse({ error: createUserError.message }, 400);
    }

    if (!createdUser.user?.id) {
      return jsonResponse({ error: 'Usuário criado sem ID retornado.' }, 500);
    }

    const { error: updateError } = await adminClient
      .from('partner_company_users')
      .update({
        user_id: createdUser.user.id,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    return jsonResponse({
      success: true,
      action: 'create_login',
      userId: createdUser.user.id,
      email: member.email,
      temporaryPassword,
      message: 'Login criado e vinculado com sucesso.',
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar login.',
    }, 500);
  }
});
