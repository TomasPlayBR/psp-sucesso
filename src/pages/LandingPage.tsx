import { Shield, Users, AlertTriangle, Radio, ChevronRight, ExternalLink, Megaphone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import emblem from "@/assets/psp-emblem.png";

const POSTS = [
  {
    date: "20 Fev 2026",
    title: "Recrutamento Aberto — Vaga para Agentes",
    content: "A PSP Sucesso RP está a recrutar novos agentes! Se tens interesse em servir a cidade com profissionalismo, candidata-te através da página Junta-te a Nós.",
    tag: "Recrutamento",
    tagColor: "hsl(145 60% 50%)",
  },
  {
    date: "18 Fev 2026",
    title: "Atualização do Sistema de Códigos 10",
    content: "Os códigos de comunicação rádio foram atualizados com novas categorias e um sistema de pesquisa para facilitar as operações em patrulha.",
    tag: "Sistema",
    tagColor: "hsl(200 80% 60%)",
  },
  {
    date: "15 Fev 2026",
    title: "Nova Política de Blacklist",
    content: "A partir de hoje, todos os registos na blacklist serão públicos e acessíveis a qualquer cidadão. A transparência é um dos nossos pilares.",
    tag: "Diretiva",
    tagColor: "hsl(var(--gold))",
  },
];

const FEATURES = [
  {
    icon: Users,
    title: "Gestão de Efetivos",
    desc: "Controlo completo dos agentes, patentes e operações internas.",
    color: "hsl(var(--gold))",
  },
  {
    icon: AlertTriangle,
    title: "Blacklist Ativa",
    desc: "Registo público de infratores com níveis de perigo em tempo real.",
    color: "hsl(0 70% 60%)",
  },
  {
    icon: Radio,
    title: "Códigos 10",
    desc: "Sistema de comunicações rádio completo para operações em patrulha.",
    color: "hsl(200 80% 60%)",
  },
  {
    icon: Shield,
    title: "Recrutamento",
    desc: "Processo de seleção estruturado com entrevistas e avaliações.",
    color: "hsl(145 60% 50%)",
  },
];

const STATS = [
  { label: "Hierarquia Completa", value: "15 Patentes" },
  { label: "Sistema de Logs", value: "Auditoria Total" },
  { label: "Segurança", value: "Firebase Auth" },
];

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Header */}
      <header className="psp-header relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={emblem} alt="PSP" className="w-10 h-10 object-cover rounded-full landing-emblem"
              style={{ border: "2px solid hsl(var(--gold)/0.5)" }} />
            <div>
              <div className="text-lg font-bold tracking-widest uppercase"
                style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif", lineHeight: 1 }}>
                PSP Sucesso
              </div>
              <div className="text-[10px] tracking-[0.25em] uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                Polícia de Segurança Pública
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/blacklist-pub" className="btn-ghost text-xs hidden sm:inline-flex">Blacklist</Link>
            <Link to="/junta-te" className="btn-ghost text-xs hidden sm:inline-flex">Junta-te</Link>
            {currentUser ? (
              <Link to="/hub" className="btn-gold text-xs">Entrar no Sistema</Link>
            ) : (
              <Link to="/login" className="btn-gold text-xs">Login PSP</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-20 px-6">
        {/* Animated background effects */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)" }} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Emblem */}
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden landing-emblem-glow"
              style={{
                border: "3px solid hsl(var(--gold) / 0.4)",
                boxShadow: "0 0 60px hsl(var(--gold) / 0.15), inset 0 0 30px hsl(var(--gold) / 0.05)"
              }}>
              <img src={emblem} alt="PSP Sucesso" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="inline-block mb-4 px-4 py-1 rounded-full text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{
              background: "hsl(var(--gold) / 0.08)",
              border: "1px solid hsl(var(--gold) / 0.2)",
              color: "hsl(var(--gold))",
              fontFamily: "Rajdhani, sans-serif"
            }}>
            Sucesso Roleplay
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
            Polícia de{" "}
            <span style={{ color: "hsl(var(--gold))" }}>Segurança</span>{" "}
            Pública
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            Garantimos a ordem, segurança e justiça na cidade, atuando de forma profissional e organizada dentro do roleplay.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/junta-te" className="btn-gold inline-flex items-center justify-center gap-2 text-sm px-8 py-3">
              <Shield size={16} />
              Quero ser PSP
            </Link>
            <Link to="/blacklist-pub" className="btn-ghost inline-flex items-center justify-center gap-2 text-sm px-8 py-3">
              <AlertTriangle size={16} />
              Ver Blacklist
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-14 max-w-lg mx-auto">
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                  {value}
                </div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
              O Nosso Sistema
            </h2>
            <div className="gold-line w-16 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="psp-card p-5 group hover:scale-[1.02] transition-transform duration-200"
                style={{ borderColor: color + "30" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: color + "12", border: `1px solid ${color}30` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1"
                  style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publicações */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Megaphone size={20} style={{ color: "hsl(var(--gold))" }} />
              <h2 className="text-2xl font-bold uppercase tracking-widest"
                style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                Publicações
              </h2>
            </div>
            <div className="gold-line w-16 mx-auto" />
            <p className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Novidades e comunicados da Direção
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POSTS.map((post) => (
              <article key={post.title} className="psp-card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform duration-200"
                style={{ borderColor: post.tagColor + "25" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ background: post.tagColor + "15", color: post.tagColor, border: `1px solid ${post.tagColor}30` }}>
                    {post.tag}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Calendar size={10} />
                    {post.date}
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-snug"
                  style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {post.title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {post.content}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-16" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-3xl mx-auto psp-card p-8 text-center"
          style={{ borderColor: "hsl(var(--gold) / 0.2)", boxShadow: "0 0 40px hsl(var(--gold) / 0.05)" }}>
          <h2 className="text-xl font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
            Acerca de Nós
          </h2>
          <div className="gold-line w-12 mx-auto mb-4" />
          <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            A PSP do Sucesso RP é uma corporação focada na garantia da ordem, segurança e justiça na cidade, atua de forma
            organizada dentro do roleplay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://discord.gg/hEjDPYcgxV" target="_blank" rel="noopener noreferrer"
              className="btn-gold inline-flex items-center justify-center gap-2 text-xs px-6 py-2.5">
              <ExternalLink size={13} />
              Discord da PSP
            </a>
            <Link to="/junta-te" className="btn-ghost inline-flex items-center justify-center gap-2 text-xs px-6 py-2.5">
              <ChevronRight size={13} />
              Saber Mais
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
          © 2026 PSP — Sucesso Roleplay — TomasPlayBR
        </p>
      </footer>
    </div>
  );
}
