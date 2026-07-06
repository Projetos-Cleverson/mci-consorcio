import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useFunnelContext } from '@/hooks/useFunnelContext';

const whatsappUrl = `https://wa.me/${APP_CONFIG.temporaryOperationsWhatsapp}`;

export default function TermsOfUse() {
  const { partnerSlug, buildPath } = useFunnelContext();
  const homeLink = partnerSlug !== 'direto' ? buildPath(`/p/${partnerSlug}`) : buildPath('/');
  const privacyLink = buildPath(APP_CONFIG.privacyPolicyPath);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link to={homeLink} className="flex items-center gap-3 font-semibold text-slate-950">
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Building2 className="size-4" />
            </span>
            MCI Consórcio
          </Link>
          <Link to={homeLink} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C47A21]">Condições de utilização</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Termos de Uso do MCI Consórcio</h1>
        <p className="mt-5 text-sm text-slate-500">Última atualização: 4 de julho de 2026.</p>

        <div className="mt-10 space-y-9 text-[0.98rem] leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-950">1. Identificação</h2>
            <p className="mt-3">
              O MCI Consórcio é um produto da EPSA Core, operado por <strong>{APP_CONFIG.legalName}</strong>, CNPJ <strong>{APP_CONFIG.cnpj}</strong>, com endereço em {APP_CONFIG.address}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">2. Natureza do diagnóstico</h2>
            <p className="mt-3">
              O serviço oferece uma orientação inicial baseada nas respostas fornecidas. O resultado não é proposta comercial, recomendação financeira individualizada, aprovação, promessa de contemplação, garantia de prazo ou garantia de contratação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">3. Consórcio e administradora</h2>
            <p className="mt-3">
              O MCI e a EPSA Core não são administradoras de consórcio. Quando houver continuidade comercial, a empresa parceira deverá informar a administradora relacionada à proposta, as condições, taxas, regras do grupo e os documentos aplicáveis antes de qualquer contratação.
            </p>
            <p className="mt-3">
              A contemplação depende das regras do grupo e pode ocorrer por sorteio ou lance, sem garantia de data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">4. Empresas parceiras</h2>
            <p className="mt-3">
              Links identificados podem encaminhar o atendimento a uma empresa parceira específica. A identidade da empresa é apresentada na página e no consentimento antes do envio dos dados. A empresa parceira é responsável pelas informações, propostas e atendimentos comerciais que realizar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">5. Deveres do usuário</h2>
            <p className="mt-3">
              O usuário deve fornecer informações verdadeiras, utilizar a plataforma de forma lícita e não tentar acessar áreas restritas, interferir no funcionamento, automatizar envios abusivos ou utilizar os conteúdos de modo a violar direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">6. Disponibilidade</h2>
            <p className="mt-3">
              Buscamos manter a plataforma disponível e segura, mas podem ocorrer interrupções para manutenção, atualização, falha de fornecedores ou eventos fora do controle razoável da operação. Um resultado somente é liberado depois que o registro do diagnóstico é confirmado pelo sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">7. Propriedade intelectual</h2>
            <p className="mt-3">
              A estrutura, os textos, a metodologia, os perfis, o software e os elementos visuais do MCI são protegidos e não podem ser copiados, revendidos, modificados ou explorados sem autorização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">8. Dados pessoais</h2>
            <p className="mt-3">
              O tratamento de dados é descrito na <Link to={privacyLink} className="font-semibold text-[#0F2B4C] underline">Política de Privacidade</Link>, que integra estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">9. Contato</h2>
            <p className="mt-3">Dúvidas operacionais podem ser encaminhadas pelo canal institucional temporário:</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C47A21] px-5 py-3 text-sm font-bold text-white">
              <MessageCircle className="size-4" />
              Falar com a EPSA
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
