import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useFunnelContext } from '@/hooks/useFunnelContext';

const whatsappUrl = `https://wa.me/${APP_CONFIG.temporaryOperationsWhatsapp}`;

export default function PrivacyPolicy() {
  const { partnerSlug, buildPath } = useFunnelContext();
  const homeLink = partnerSlug !== 'direto' ? buildPath(`/p/${partnerSlug}`) : buildPath('/');

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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C47A21]">Privacidade e proteção de dados</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Política de Privacidade do MCI Consórcio</h1>
        <p className="mt-5 text-sm text-slate-500">Última atualização: 4 de julho de 2026.</p>

        <div className="mt-10 space-y-9 text-[0.98rem] leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-950">1. Quem opera a plataforma</h2>
            <p className="mt-3">
              O MCI Consórcio é um produto da EPSA Core, operado por <strong>{APP_CONFIG.legalName}</strong>, CNPJ <strong>{APP_CONFIG.cnpj}</strong>, com endereço em {APP_CONFIG.address}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">2. Dados tratados</h2>
            <p className="mt-3">
              Podemos tratar as respostas do diagnóstico, nome, telefone, e-mail, cidade, estado, horário de contato, perfil calculado e informações técnicas de origem, como parâmetros UTM, identificadores de campanha, GCLID, página de entrada, referência e categoria do dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">3. Para que os dados são utilizados</h2>
            <p className="mt-3">
              Os dados são utilizados para gerar e registrar o diagnóstico, apresentar o resultado, encaminhar o atendimento solicitado, organizar a operação comercial, medir a origem das campanhas, prevenir fraudes, manter a segurança e aperfeiçoar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">4. Compartilhamento com a empresa parceira</h2>
            <p className="mt-3">
              Quando o acesso ocorre por um link identificado, o formulário informa qual empresa parceira receberá os dados para realizar o atendimento relacionado ao interesse manifestado. A GVS/EPSA e a empresa parceira são responsáveis pelos tratamentos que realizarem dentro de suas respectivas atividades.
            </p>
            <p className="mt-3">
              Os dados também podem ser processados por fornecedores de infraestrutura, banco de dados, hospedagem, segurança e comunicação estritamente necessários ao funcionamento da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">5. Consentimento e registro</h2>
            <p className="mt-3">
              Antes do envio, o usuário visualiza o texto de autorização aplicável ao parceiro identificado. Registramos a versão do termo, a data do aceite, o parceiro e a origem da navegação para demonstrar o contexto em que os dados foram fornecidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">6. Armazenamento e segurança</h2>
            <p className="mt-3">
              Adotamos controles técnicos e organizacionais de acesso, separação por produto e empresa, autenticação e registro operacional. Os dados são mantidos pelo período necessário às finalidades informadas, ao atendimento de obrigações legais e ao exercício regular de direitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">7. Direitos do titular</h2>
            <p className="mt-3">
              O titular pode solicitar confirmação de tratamento, acesso, correção, informação sobre compartilhamento, eliminação quando aplicável e revogação do consentimento, sem prejuízo das hipóteses legais de conservação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">8. Canal de contato</h2>
            <p className="mt-3">
              Solicitações relacionadas a dados pessoais podem ser iniciadas pelo canal institucional temporário abaixo. Para segurança, poderemos solicitar informações que permitam confirmar a identidade do solicitante.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C47A21] px-5 py-3 text-sm font-bold text-white">
              <MessageCircle className="size-4" />
              {APP_CONFIG.privacyContactLabel}
            </a>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">9. Atualizações</h2>
            <p className="mt-3">
              Esta política poderá ser atualizada para refletir mudanças operacionais, tecnológicas ou legais. A versão vigente permanecerá disponível nesta página.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
