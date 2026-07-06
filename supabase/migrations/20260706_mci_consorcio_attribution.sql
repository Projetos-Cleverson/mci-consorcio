-- =========================================================
-- MCI CONSÓRCIO — Attribution / Origem de Campanha
-- Data: 2026-07-06
-- Escopo: adicionar campos para preservar UTMs e identificadores
-- de clique sem instalar Google Ads Tag e sem alterar dados existentes.
-- =========================================================

begin;

alter table public.mci_consorcio_leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text;

comment on column public.mci_consorcio_leads.utm_source is 'Origem da campanha recebida pela URL pública do parceiro. Ex.: google.';
comment on column public.mci_consorcio_leads.utm_medium is 'Mídia da campanha recebida pela URL pública do parceiro. Ex.: cpc.';
comment on column public.mci_consorcio_leads.utm_campaign is 'Nome padronizado da campanha informado na URL.';
comment on column public.mci_consorcio_leads.utm_content is 'Identificação opcional do anúncio/criativo.';
comment on column public.mci_consorcio_leads.utm_term is 'Termo/palavra-chave informado na URL, quando aplicável.';
comment on column public.mci_consorcio_leads.gclid is 'Identificador de clique do Google Ads quando presente na URL.';
comment on column public.mci_consorcio_leads.gbraid is 'Identificador de clique Google para cenários iOS/app quando presente na URL.';
comment on column public.mci_consorcio_leads.wbraid is 'Identificador de clique Google para cenários web/iOS quando presente na URL.';

create index if not exists idx_mci_consorcio_leads_utm_source
  on public.mci_consorcio_leads (utm_source)
  where utm_source is not null;

create index if not exists idx_mci_consorcio_leads_utm_campaign
  on public.mci_consorcio_leads (utm_campaign)
  where utm_campaign is not null;

create index if not exists idx_mci_consorcio_leads_partner_campaign_created
  on public.mci_consorcio_leads (partner_slug, utm_campaign, created_at desc)
  where utm_campaign is not null;

create index if not exists idx_mci_consorcio_leads_gclid
  on public.mci_consorcio_leads (gclid)
  where gclid is not null;

create index if not exists idx_mci_consorcio_leads_gbraid
  on public.mci_consorcio_leads (gbraid)
  where gbraid is not null;

create index if not exists idx_mci_consorcio_leads_wbraid
  on public.mci_consorcio_leads (wbraid)
  where wbraid is not null;

commit;
