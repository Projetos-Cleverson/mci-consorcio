import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--deep-blue)] py-12 text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-white/10">
                <Building2 className="size-5 text-white" />
              </div>

              <div className="leading-tight">
                <p className="font-semibold text-white">
                  MCI
                </p>
                <p className="text-xs text-white/55">
                  Mapa da Compra Imobiliária
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/60">
              Uma ferramenta da Universidade EPSA para ajudar clientes a tomarem decisões imobiliárias com mais clareza, estratégia e responsabilidade.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Aviso legal
            </h4>

            <p className="text-xs leading-relaxed text-white/50">
              Este diagnóstico não garante contemplação, aprovação, proposta oficial, contratação de consórcio ou resultado. Ele é apenas uma orientação inicial baseada nas informações fornecidas.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              Privacidade
            </h4>

            <p className="text-xs leading-relaxed text-white/50">
              Seus dados são tratados com respeito e utilizados apenas para atendimento, diagnóstico e acompanhamento comercial, conforme autorização fornecida no formulário e em conformidade com a LGPD.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} MCI Consórcio Imobiliário. Powered by Universidade EPSA.
          </p>
        </div>
      </div>
    </footer>
  );
}