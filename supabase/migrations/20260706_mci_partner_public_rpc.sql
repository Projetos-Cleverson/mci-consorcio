-- =========================================================
-- MCI Consórcio — Leitura pública mínima de parceiro por slug
-- Objetivo: permitir que a landing e o resultado carreguem nome/WhatsApp
-- do parceiro sem abrir SELECT amplo em partner_companies e sem alterar RLS.
-- =========================================================

begin;

-- Colunas públicas opcionais usadas pelo front-end.
-- São aditivas e não alteram políticas RLS existentes.
alter table public.partner_companies
  add column if not exists display_name text,
  add column if not exists logo_url text,
  add column if not exists primary_color text,
  add column if not exists secondary_color text;

comment on column public.partner_companies.display_name is 'Nome público exibido nas páginas de captação do parceiro.';
comment on column public.partner_companies.logo_url is 'URL pública opcional do logo do parceiro.';
comment on column public.partner_companies.primary_color is 'Cor primária opcional do parceiro para identidade visual.';
comment on column public.partner_companies.secondary_color is 'Cor secundária opcional do parceiro para identidade visual.';

-- RPC pública controlada: expõe somente dados necessários para a página pública.
-- Não expõe responsável, e-mail interno, usuários, permissões, plano ou dados sensíveis.
create or replace function public.get_mci_partner_public(p_slug text)
returns table (
  id uuid,
  name text,
  slug text,
  display_name text,
  logo_url text,
  commercial_whatsapp text,
  city text,
  state text,
  primary_color text,
  secondary_color text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pc.id,
    pc.name,
    pc.slug,
    coalesce(nullif(pc.display_name, ''), pc.name) as display_name,
    pc.logo_url,
    pc.commercial_whatsapp,
    pc.city,
    pc.state,
    pc.primary_color,
    pc.secondary_color,
    pc.status
  from public.partner_companies pc
  where lower(pc.slug) = lower(trim(p_slug))
    and pc.status in ('active', 'pilot')
  limit 1;
$$;

revoke all on function public.get_mci_partner_public(text) from public;
grant execute on function public.get_mci_partner_public(text) to anon, authenticated;

comment on function public.get_mci_partner_public(text) is 'Retorna somente dados públicos mínimos de parceiro ativo/piloto para landing pages MCI Consórcio.';

commit;
