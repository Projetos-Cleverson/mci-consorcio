-- =========================================================
-- MCI CONSÓRCIO IMOBILIÁRIO
-- Schema inicial para demonstração/piloto
-- =========================================================
-- Este SQL cria:
-- 1. partner_companies: empresas parceiras do MCI Consórcio
-- 2. mci_consorcio_leads: leads gerados pelo diagnóstico
-- 3. índices para filtros do painel admin
-- 4. políticas RLS permissivas para demonstração
--
-- IMPORTANTE:
-- As políticas abaixo são adequadas para demonstração e piloto controlado.
-- Antes de rodar campanha real, proteja o painel admin e endureça as RLS.
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. EMPRESAS PARCEIRAS
-- =========================================================

create table if not exists public.partner_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  responsible_name text,
  responsible_email text,
  responsible_phone text,
  commercial_whatsapp text,
  city text,
  state text,
  status text not null default 'active' check (status in ('active', 'inactive', 'pilot')),
  plan_type text not null default 'piloto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_partner_companies_slug on public.partner_companies(slug);
create index if not exists idx_partner_companies_status on public.partner_companies(status);

insert into public.partner_companies (name, slug, status, plan_type)
values
  ('Empresa Piloto A', 'empresa-a', 'pilot', 'piloto'),
  ('Empresa Piloto B', 'empresa-b', 'pilot', 'piloto')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status,
  plan_type = excluded.plan_type,
  updated_at = now();

-- =========================================================
-- 2. LEADS DO MCI CONSÓRCIO IMOBILIÁRIO
-- =========================================================

create table if not exists public.mci_consorcio_leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  city text,
  state text,
  contact_time text,
  partner_slug text not null default 'direto',
  source_system text not null default 'mci_consorcio_imobiliario',
  diagnostic_model text not null default 'mci_consorcio_imobiliario',
  diagnostic_result text not null check (
    diagnostic_result in (
      'consorcio_planejado',
      'lance_estrategico',
      'estrategia_patrimonial',
      'troca_upgrade',
      'preparacao_consorcio',
      'analise_aderencia_necessaria'
    )
  ),
  answers_json jsonb not null default '[]'::jsonb,
  score_json jsonb not null default '{}'::jsonb,
  status text not null default 'novo_diagnostico' check (
    status in (
      'novo_diagnostico',
      'primeiro_contato_enviado',
      'em_atendimento',
      'simulacao_solicitada',
      'proposta_enviada',
      'preparacao_futura',
      'perdido',
      'convertido'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mci_consorcio_leads_partner_slug on public.mci_consorcio_leads(partner_slug);
create index if not exists idx_mci_consorcio_leads_diagnostic_result on public.mci_consorcio_leads(diagnostic_result);
create index if not exists idx_mci_consorcio_leads_status on public.mci_consorcio_leads(status);
create index if not exists idx_mci_consorcio_leads_created_at on public.mci_consorcio_leads(created_at desc);
create index if not exists idx_mci_consorcio_leads_email on public.mci_consorcio_leads(email);
create index if not exists idx_mci_consorcio_leads_phone on public.mci_consorcio_leads(phone);

-- =========================================================
-- 3. RLS — versão demonstrativa/piloto
-- =========================================================

alter table public.partner_companies enable row level security;
alter table public.mci_consorcio_leads enable row level security;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "demo_select_partner_companies" ON public.partner_companies;
DROP POLICY IF EXISTS "demo_select_mci_consorcio_leads" ON public.mci_consorcio_leads;
DROP POLICY IF EXISTS "demo_insert_mci_consorcio_leads" ON public.mci_consorcio_leads;
DROP POLICY IF EXISTS "demo_update_mci_consorcio_leads" ON public.mci_consorcio_leads;

-- Parceiros podem ser lidos pela aplicação para uso futuro de CTA/WhatsApp
create policy "demo_select_partner_companies"
on public.partner_companies
for select
to anon, authenticated
using (true);

-- Para demonstração, o admin público consegue listar leads.
-- Antes de campanha real, restringir isso a usuários autenticados/admin.
create policy "demo_select_mci_consorcio_leads"
on public.mci_consorcio_leads
for select
to anon, authenticated
using (true);

-- Permite que o formulário público insira leads.
create policy "demo_insert_mci_consorcio_leads"
on public.mci_consorcio_leads
for insert
to anon, authenticated
with check (true);

-- Permite alteração de status pelo admin demonstrativo.
-- Antes de campanha real, restringir isso a usuários autenticados/admin.
create policy "demo_update_mci_consorcio_leads"
on public.mci_consorcio_leads
for update
to anon, authenticated
using (true)
with check (true);

-- =========================================================
-- 4. CONFERÊNCIA
-- =========================================================

select 'partner_companies' as tabela, count(*) as total from public.partner_companies
union all
select 'mci_consorcio_leads' as tabela, count(*) as total from public.mci_consorcio_leads;
