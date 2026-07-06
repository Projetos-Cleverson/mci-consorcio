# Checklist de promoção para produção — MCI Consórcio

## Antes do merge

- [ ] Branch de origem: `preview/mci-phase1e-a-04jul2026`
- [ ] Branch de destino: `main`
- [ ] Build aprovado
- [ ] TypeScript aprovado
- [ ] ESLint sem erros bloqueantes
- [ ] Fase 1E-B validada
- [ ] Edge Function `create-team-user` ativa na versão 4 ou superior
- [ ] Hero desktop e mobile validadas
- [ ] Fluxo público completo validado
- [ ] Isolamento por parceiro, produto e responsável validado
- [ ] Política de Privacidade e Termos publicados
- [ ] Senhas temporárias expostas nos testes substituídas

## Higienização antes da campanha

- [ ] Remover ou marcar como teste todos os leads criados durante a validação
- [ ] Suspender ou excluir usuários de teste que não serão usados
- [ ] Confirmar WhatsApp definitivo da RF Consórcio
- [ ] Substituir o WhatsApp provisório da EPSA quando o número da RF for fornecido
- [ ] Confirmar e-mail institucional de contato e canal de privacidade
- [ ] Revisão jurídica final dos textos legais

## Pull Request

Título sugerido:

```text
Promote MCI Consórcio multiempresa to production
```

Descrição sugerida:

```text
- consolida a landing page multiempresa por parceiro
- preserva UTMs, gclid e consentimento
- exige persistência do lead antes do resultado
- adiciona Política de Privacidade e Termos
- usa a superfície pública segura de parceiros
- aplica autorização explícita por empresa e produto
- persiste perfil principal e tendência secundária
- mantém timestamps sob responsabilidade do banco
- prepara publicação no Cloudflare Pages
- preserva o MCI Imobiliário no banco compartilhado
```

## Cloudflare Pages

- [ ] Projeto conectado ao GitHub
- [ ] Production branch = `main`
- [ ] Framework = Vite
- [ ] Build command = `npm run build`
- [ ] Output directory = `dist`
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `VITE_APP_URL=https://mci-consorcio.epsacore.com.br`
- [ ] Primeiro deployment `pages.dev` validado
- [ ] Domínio adicionado no Pages antes do CNAME
- [ ] CNAME `mci-consorcio` apontado ao projeto Pages
- [ ] Certificado TLS ativo

## Pós-publicação

- [ ] `/p/rfconsorcios` carrega a empresa correta
- [ ] Diagnóstico salva lead real de controle
- [ ] UTMs e consentimento aparecem no banco
- [ ] Resultado e WhatsApp funcionam
- [ ] Painel da RF mostra o lead
- [ ] Consultor vê somente lead atribuído
- [ ] `/privacidade` e `/termos` respondem 200
- [ ] `/admin/*`, `/dados`, `/resultado` e `/diagnostico` retornam `X-Robots-Tag: noindex`
- [ ] Hostname `pages.dev` retorna `X-Robots-Tag: noindex`
- [ ] Google Ads usa somente o domínio oficial
