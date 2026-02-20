import { useAuth } from "@/context/AuthContext";
import { ROLE_HIERARCHY, SUPERIOR_ROLES } from "@/lib/roles";
import { 
  Star, Shield, FileText, Users, MessageSquare, 
  CheckCircle2, AlertOctagon, Info, Scale, Clock 
} from "lucide-react";

const HIERARCHY_DISPLAY = [
  { role: "Diretor Nacional", description: "Direção Nacional" },
  { role: "Diretor Nacional Adjunto", description: "Direção Nacional" },
  { role: "Superintendente-Chefe", description: "Carreira de Oficiais" },
  { role: "Superintendente", description: "Carreira de Oficiais" },
  { role: "Intendente", description: "Carreira de Oficiais" },
  { role: "Subintendente", description: "Carreira de Oficiais" },
  { role: "Comissário", description: "Carreira de Oficiais" },
  { role: "Subcomissário", description: "Carreira de Oficiais" },
];

export default function Superiores() {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header com Identidade Visual */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani" }}>
            <Star size={28} className="animate-pulse" /> PAINEL DE COMANDO ADM
          </h1>
          <p className="text-sm opacity-70 flex items-center gap-2">
            <Shield size={14} /> Acesso Restrito: Oficiais e Direção
          </p>
        </div>
        
        {currentUser && (
          <div className="psp-card px-4 py-2 flex items-center gap-3 bg-gold/5 border-gold/30">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-tighter opacity-60">Operador Autenticado</p>
              <p className="font-bold text-sm leading-none">{currentUser.username}</p>
            </div>
            <div className="rank-badge text-[10px]">{currentUser.role}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: REGRAS E GUIAS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECÇÃO 1: BOAS-VINDAS TICKET */}
          <div className="psp-card p-6 border-l-4 border-l-blue-500">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-wider" style={{ fontFamily: "Rajdhani" }}>
              <MessageSquare size={20} className="text-blue-500" /> Script de Abertura (Ticket)
            </h2>
            <div className="bg-background/50 p-4 rounded border border-border space-y-3 relative group">
              <p className="text-sm italic text-gold">"Olá @Candidato, tudo bem? Umas informações antes de começarmos."</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Seja honesto nas respostas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> Explique tudo com clareza</li>
                <li className="flex items-center gap-2"><AlertOctagon size={12} className="text-red-500" /> Desrespeito = Reprovação imediata</li>
                <li className="flex items-center gap-2"><Clock size={12} className="text-blue-500" /> Processo demorado (Paciência)</li>
              </ul>
              <button className="absolute top-2 right-2 text-[10px] bg-white/5 px-2 py-1 rounded hover:bg-gold/20 transition-colors">Copiar Texto</button>
            </div>
          </div>

          {/* SECÇÃO 2: GUIA DE ENTREVISTA (O "CORE" DO CÓDIGO) */}
          <div className="psp-card p-6 border-l-4 border-l-gold">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 uppercase tracking-wider" style={{ fontFamily: "Rajdhani" }}>
              <Users size={20} className="text-gold" /> Protocolo de Entrevista Oral
            </h2>
            <div className="space-y-4">
              <div className="bg-gold/5 p-3 rounded-md border border-gold/20 text-[11px] leading-relaxed italic">
                Nota: O responsável pelo Recrutamento (REC) avalia em silêncio. Se aprovado, comunica internamente para o Responsável pelo Ticket marcar a data final.
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Perguntas Obrigatórias:</p>
                <div className="grid gap-2 text-sm bg-background/30 p-4 rounded">
                  {[
                    "Apresenta-te brevemente.",
                    "Porque te candidataste a este recrutamento?",
                    "O que sabes sobre a nossa organização?",
                    "Como lidas com regras e hierarquia?",
                    "Já tiveste algum problema em grupos anteriores? Explica.",
                    "Como reages a ordens com as quais não concordas?",
                    "Trabalhas melhor sozinho ou em equipa? Porquê?",
                    "Como ages em situações de conflito?",
                    "Tens disponibilidade para evoluir na estrutura?",
                    "Onde te vês dentro da organização no futuro?"
                  ].map((q, i) => (
                    <div key={i} className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
                      <span className="text-gold font-mono text-xs">{i + 1}.</span>
                      <p>{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLÁUSULAS DE COMPROMISSO */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Cláusulas de Compromisso Final:</p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded">
                    "Esta é uma organização estruturada. Se a primeira coisa que fizeres for asneira, serás expulso. Concordas?"
                  </div>
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded">
                    "Seguirás ordens superiores mesmo tendo a razão. Concordas?"
                  </div>
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded">
                    "Se saíres em menos de 2 semanas, vais para a Blacklist. Concordas?"
                  </div>
                </div>
              </div>

              <div className="bg-background p-4 rounded border border-dashed border-border text-center">
                <p className="text-xs italic opacity-60">Script de Encerramento:</p>
                <p className="text-sm mt-2">"Entrevista concluída. As tuas respostas serão avaliadas por um superior. Aguarda pacientemente."</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: STATUS E HIERARQUIA */}
        <div className="space-y-6">
          
          {/* O QUE OFERECEMOS */}
          <div className="psp-card p-5 bg-gradient-to-br from-navy to-navy-light">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase text-gold" style={{ fontFamily: "Rajdhani" }}>
              <Info size={16} /> O Que Oferecemos
            </h2>
            <div className="space-y-2 text-xs">
              {[
                "Estrutura organizada.",
                "Ambiente sério e respeitoso.",
                "Possibilidade de progressão.",
                "Apoio da equipa.",
                "Sistema de hierarquia definido."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                  <div className="w-1 h-1 bg-gold rounded-full" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* MOTIVOS DE PUNIÇÃO / BLACKLIST */}
          <div className="psp-card p-5 border-l-4 border-l-red-600">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase text-red-500" style={{ fontFamily: "Rajdhani" }}>
              <AlertOctagon size={16} /> Tabela de Sanções
            </h2>
            <div className="space-y-1 text-[11px]">
              <div className="p-2 hover:bg-red-500/10 rounded transition-colors">⚠️ Inatividade (1 semana sem aviso)</div>
              <div className="p-2 hover:bg-red-500/10 rounded transition-colors">⚠️ Falta de respeito (Grau Leve)</div>
              <div className="p-2 hover:bg-red-500/10 rounded transition-colors">⚠️ Desempenho insuficiente</div>
              <div className="p-2 hover:bg-red-500/10 rounded transition-colors">⚠️ Denúncia em RP fundamentada</div>
              <div className="p-2 hover:bg-red-500/10 rounded transition-colors">⚠️ Decisão direta da Direção</div>
            </div>
          </div>

          {/* HIERARQUIA COMPACTA */}
          <div className="psp-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-white/5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gold" style={{ fontFamily: "Rajdhani" }}>
                Comando Superior
              </h2>
            </div>
            <div className="divide-y divide-border/50">
              {HIERARCHY_DISPLAY.map(({ role, description }) => (
                <div key={role} className="flex items-center justify-between px-4 py-2 hover:bg-gold/5">
                  <div className="text-[11px] font-medium">{role}</div>
                  <div className="text-[9px] opacity-40 uppercase">{description}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
