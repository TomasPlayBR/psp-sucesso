import { Shield, CheckCircle, ExternalLink } from "lucide-react";
import emblem from "@/assets/psp-logo.png";

const REQUISITOS = [
  "Ter idade superior a 15 anos",
  "Demonstrar respeito, ética e boa conduta",
  "Entender as regras do servidor",
  "Estar disponível para participar em operações e formações",
  "Não possuir histórico de problemas internos",
];

const CRITERIOS = [
  { titulo: "Disponibilidade", desc: "Cumprir horários, participar ativamente, ser útil à organização." },
  { titulo: "Comportamento", desc: "Respeitar regras, hierarquia e membros, ser maduro e responsável." },
  { titulo: "Comunicação", desc: "Explicar ideias claramente, responder às instruções, boa postura." },
  { titulo: "Experiência", desc: "Conhecimento prévio em RP, experiência em estruturas similares." },
  { titulo: "Atitude", desc: "Interesse em evoluir, proatividade, disciplina e comprometimento." },
];

export default function JuntateaNos() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Public header */}
      <header className="psp-header">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={emblem} alt="PSP" className="w-9 h-9 object-cover rounded-full"
              style={{ border: "1px solid hsl(var(--gold)/0.4)" }} />
            <div>
              <div className="text-base font-bold tracking-widest uppercase"
                style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif", lineHeight: 1 }}>
                PSP Sucesso
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                Recrutamento
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/blacklist-pub" className="btn-ghost text-sm">Blacklist</a>
            <a href="/login" className="btn-gold text-sm">Login PSP</a>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hero */}
          <div className="psp-card p-8 text-center fade-in"
            style={{ borderColor: "hsl(var(--gold)/0.3)", boxShadow: "var(--shadow-gold)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "hsl(var(--gold)/0.1)", border: "2px solid hsl(var(--gold)/0.4)" }}>
              <Shield size={36} style={{ color: "hsl(var(--gold))" }} />
            </div>
            <h1 className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
              Junta-te à PSP
            </h1>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              A PSP do Sucesso RP procura jogadores responsáveis e dedicados para manter a ordem, o respeito e a atividade no servidor.
            </p>
            <a
              href="https://discord.gg/pspsucesso"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2 text-base px-6 py-3"
            >
              <ExternalLink size={16} />
              Fazer o Formulário de Candidatura
            </a>
          </div>

          {/* Requisitos */}
          <div className="psp-card p-6">
            <h2 className="text-lg font-bold mb-4 uppercase tracking-widest"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
              Requisitos
            </h2>
            <ul className="space-y-2">
              {REQUISITOS.map((r, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: "hsl(var(--gold))", flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Como funciona */}
          <div className="psp-card p-6">
            <h2 className="text-lg font-bold mb-4 uppercase tracking-widest"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
              Como Funciona o Recrutamento
            </h2>
            <ol className="space-y-3">
              {[
                "Abertura de ticket na categoria Recrutamento no Discord.",
                "Preenchimento das perguntas iniciais em formato de formulário.",
                "Análise pela equipa responsável.",
                "Entrevista com um superior.",
                "Resultado final comunicado no ticket pela direção.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "hsl(var(--gold)/0.15)", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold)/0.4)" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Critérios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CRITERIOS.map(({ titulo, desc }) => (
              <div key={titulo} className="psp-card p-4">
                <h3 className="font-bold text-sm mb-1 uppercase tracking-wider"
                  style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                  {titulo}
                </h3>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            © 2026 PSP — Sucesso Roleplay — TomasPlayBR
          </p>
        </div>
      </main>
    </div>
  );
}
