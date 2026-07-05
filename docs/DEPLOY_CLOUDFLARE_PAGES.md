# Implantação do MCI Consórcio no Cloudflare Pages

## Escopo

Aplicação React/Vite estática, publicada pelo repositório GitHub:

- Repositório: `Projetos-Cleverson/mci-consorcio`
- Branch de produção: `main`
- Domínio oficial: `mci-consorcio.epsacore.com.br`
- Banco compartilhado: Supabase do ecossistema MCI

## Configuração recomendada do projeto Pages

No painel Cloudflare, acesse **Workers & Pages → Create application → Pages → Connect to Git** e conecte o repositório.

Use:

- **Production branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`
- **Node.js:** fixado no repositório por `.node-version` em `22.16.0`

O Cloudflare Pages reconhece esta aplicação como SPA porque não existe um `404.html` na raiz do build. Não adicione um `404.html` sem revisar o roteamento, pois as rotas `/p/:partnerSlug`, `/diagnostico`, `/dados`, `/resultado` e `/admin/*` dependem do fallback SPA.

## Variáveis de ambiente

Cadastre em **Settings → Environment variables** para **Production**:

```text
VITE_SUPABASE_URL=<URL pública do projeto Supabase>
VITE_SUPABASE_ANON_KEY=<chave anon pública do projeto Supabase>
VITE_APP_URL=https://mci-consorcio.epsacore.com.br
```

Não use `service_role` no frontend. Não cadastre `VITE_ADMIN_PASSWORD`; o painel usa Supabase Auth.

Para Preview, use as mesmas variáveis apenas quando houver necessidade de teste consciente contra o banco compartilhado. Builds de Preview podem criar dados reais de teste.

## Domínio personalizado sem migrar os nameservers

Para a primeira publicação, o caminho mais seguro é manter o DNS atual do `epsacore.com.br` e criar somente o subdomínio.

1. No projeto Pages, abra **Custom domains**.
2. Clique em **Set up a domain**.
3. Informe `mci-consorcio.epsacore.com.br`.
4. Aguarde o Pages indicar o destino `<nome-do-projeto>.pages.dev`.
5. No provedor DNS atual, crie:

```text
Tipo: CNAME
Nome/Host: mci-consorcio
Destino/Valor: <nome-do-projeto>.pages.dev
TTL: padrão ou 300 segundos
```

É obrigatório associar primeiro o domínio dentro do projeto Pages; criar apenas o CNAME pode resultar em erro de resolução.

## Migração futura do DNS completo para Cloudflare

A migração dos nameservers do domínio principal pode ser feita posteriormente. Antes disso, replique e valide todos os registros existentes, principalmente:

- MX de e-mail;
- SPF, DKIM e DMARC;
- TXT de validação do Google;
- CNAMEs e subdomínios ativos;
- registros usados pela Vercel ou outros serviços.

Não altere os nameservers sem esse inventário, pois isso pode interromper e-mail e outros sistemas da EPSA Core.

## Arquivos específicos do Cloudflare

- `public/_headers`: cabeçalhos de segurança e `noindex` para rotas operacionais e hostnames `pages.dev`.
- `.node-version`: fixa a versão do Node usada no build.

Não foi adicionado `_redirects`: o fallback SPA nativo do Pages será usado.

## Checklist após o primeiro deploy

Validar no hostname `pages.dev` antes de conectar o domínio:

1. `/`
2. `/p/rfconsorcios`
3. `/privacidade`
4. `/termos`
5. `/admin/login`
6. login matriz, gestor e consultor;
7. diagnóstico completo e gravação do lead;
8. atribuição de lead ao consultor;
9. WhatsApp do parceiro;
10. viewport mobile de 390 px.

Depois de conectar o domínio, repetir os itens acima em `https://mci-consorcio.epsacore.com.br`.

## Rollback operacional

Se o deploy de produção apresentar regressão:

1. Abra **Deployments** no projeto Pages.
2. Localize o último deployment de produção estável.
3. Abra o menu de ações (`...`).
4. Selecione **Rollback to this deployment**.

O rollback do Pages não reverte alterações no Supabase. Migrações do banco devem usar seus próprios scripts de rollback, apenas quando expressamente necessário.

## Vercel durante a transição

Mantenha a Vercel ativa até o domínio Cloudflare ser validado. Não direcione a campanha para a Vercel após o domínio oficial entrar em operação. O endereço oficial e os metadados da aplicação devem permanecer em:

```text
https://mci-consorcio.epsacore.com.br
```
