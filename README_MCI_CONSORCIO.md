# MCI Consórcio — aplicação multiempresa

Produto da **EPSA Core**, operado por **GVS IMÓVEIS E SERVIÇOS DE CRÉDITOS LTDA**.

Esta aplicação atende vários parceiros a partir de uma única base de código. Cada empresa utiliza uma rota própria:

```text
https://mci-consorcio.epsacore.com.br/p/<slug-do-parceiro>
```

Exemplo previsto:

```text
https://mci-consorcio.epsacore.com.br/p/rfconsorcios
```

## Fluxo público

```text
Landing do parceiro
→ diagnóstico com 18 perguntas
→ captura e consentimento
→ confirmação de gravação no Supabase
→ resultado
→ atendimento no WhatsApp do parceiro ou canal temporário da EPSA
```

O resultado só é liberado depois que o Supabase confirma o `INSERT`. Em caso de falha, a tela permanece no formulário e permite nova tentativa.

## Rastreamento de campanha

Os parâmetros abaixo são preservados entre as rotas e registrados no JSON de metadados do lead:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid`, `gbraid` e `wbraid`
- parâmetros ValueTrack como `campaignid`, `adgroupid`, `creative`, `keyword`, `device`, `matchtype` e `network`
- URL de entrada, referência, categoria do dispositivo e user agent

Nesta versão preparatória, rastreamento e consentimento são gravados dentro de `score_json` (`_tracking`, `_consent` e `_context`) para manter compatibilidade com o schema atual. Uma migração posterior poderá criar colunas dedicadas e realizar o backfill.

## Privacidade

- O formulário mostra o parceiro que receberá os dados.
- O consentimento registra versão, data, parceiro e texto aceito.
- Nome, telefone e e-mail do lead não são armazenados no `localStorage` ou `sessionStorage` do fluxo público.
- A lista administrativa de leads não é persistida no `localStorage`; é carregada do Supabase durante a sessão autenticada.
- As páginas `/privacidade` e `/termos` apresentam os dados institucionais da GVS/EPSA.

## Dados públicos do parceiro

A consulta pública solicita somente:

```text
id, name, slug, display_name, logo_url, commercial_whatsapp,
city, state, primary_color, secondary_color, status
```

Dados internos do responsável não são solicitados pelo frontend público.

## Canal temporário

Enquanto um parceiro não possuir WhatsApp comercial cadastrado, o resultado usa temporariamente o canal institucional da EPSA:

```text
+55 21 98213-4226
```

A interface informa claramente quando esse fallback está em uso. O campo `partner_whatsapp` do lead permanece vazio até o parceiro ter um número próprio cadastrado.

## Configuração

Copie `.env.example` para `.env.local` e informe:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_URL
```

Nunca inclua `.env`, `.env.local` ou chaves administrativas no repositório ou em arquivos distribuíveis.

## Comandos

```bash
npm ci
npm run lint
npm run build
npm run dev
```

## Rotas principais

```text
/                         landing genérica
/p/:partnerSlug           landing identificada por parceiro
/diagnostico              questionário
/dados                    captura e consentimento
/resultado                resultado após persistência confirmada
/privacidade              política de privacidade
/termos                    termos de uso
/admin/*                   área autenticada
```

## Pendências antes da publicação real

1. Cadastrar a RF Consórcio com slug `rfconsorcios` no Supabase.
2. Cadastrar o WhatsApp definitivo da RF quando disponibilizado.
3. Executar a fase de banco que restringirá as colunas públicas de `partner_companies` e removerá a concessão automática de produto.
4. Configurar o DNS de `mci-consorcio.epsacore.com.br` e atualizar `VITE_APP_URL` no ambiente de produção.
5. Instalar e validar as tags de conversão somente depois de definir a conta Google Ads e o identificador de conversão.
6. Fazer teste ponta a ponta em ambiente de prévia antes de promover a versão para produção.

Os textos jurídicos incluídos são uma base operacional e devem passar por revisão jurídica antes da escala comercial.
