import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HIERARCHY } from "@/lib/roles";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Target, Users, Shuffle, CheckCircle2, Clock, MapPin, AlertTriangle, Shield, Crosshair, Zap, Star, Upload, X, FileText, Image as ImageIcon } from "lucide-react";

function getCareerTier(role: string): "agente" | "chefe" | "oficial" {
  const rank = ROLE_HIERARCHY[role] ?? 10;
  if (rank >= 35) return "oficial";
  if (rank >= 25) return "chefe";
  return "agente";
}

interface Mission {
  title: string;
  description: string;
  difficulty: "Fácil" | "Média" | "Difícil";
  icon: React.ReactNode;
  xp: number;
}

const MISSIONS: Record<string, Mission[]> = {
  agente: [
    { title: "Patrulha Urbana", description: "Realizar uma patrulha completa pela zona urbana principal, reportando qualquer atividade suspeita.", difficulty: "Fácil", icon: <MapPin size={20} />, xp: 50 },
    { title: "Controlo de Trânsito", description: "Montar operação de controlo de trânsito numa zona de elevado fluxo durante 15 minutos.", difficulty: "Fácil", icon: <Shield size={20} />, xp: 50 },
    { title: "Escolta de Civil", description: "Escoltar um civil em segurança desde o ponto A ao ponto B sem incidentes.", difficulty: "Média", icon: <Users size={20} />, xp: 100 },
    { title: "Resposta a 10-50", description: "Responder a um acidente de viação, assegurar a área e elaborar relatório.", difficulty: "Média", icon: <AlertTriangle size={20} />, xp: 100 },
    { title: "Operação Anti-Droga", description: "Participar numa operação de vigilância e detenção de tráfico de droga.", difficulty: "Difícil", icon: <Crosshair size={20} />, xp: 200 },
    { title: "Perseguição a Pé", description: "Perseguir e deter um suspeito em fuga a pé pela cidade.", difficulty: "Difícil", icon: <Target size={20} />, xp: 200 },
    { title: "Ronda Noturna", description: "Executar ronda noturna completa, verificando estabelecimentos e zonas de risco.", difficulty: "Média", icon: <MapPin size={20} />, xp: 100 },
    { title: "Verificação de Identidade", description: "Abordar e verificar identidade de 3 indivíduos suspeitos na zona comercial.", difficulty: "Fácil", icon: <Shield size={20} />, xp: 50 },
  ],
  chefe: [
    { title: "Coordenação de Operação", description: "Coordenar uma equipa de 3+ agentes numa operação de fiscalização.", difficulty: "Média", icon: <Users size={20} />, xp: 150 },
    { title: "Gestão de Perímetro", description: "Estabelecer e gerir um perímetro de segurança num evento público.", difficulty: "Média", icon: <MapPin size={20} />, xp: 150 },
    { title: "Operação de Alto Risco", description: "Liderar uma abordagem de alto risco (10-11) com coordenação tática.", difficulty: "Difícil", icon: <AlertTriangle size={20} />, xp: 300 },
    { title: "Briefing Operacional", description: "Preparar e conduzir briefing para a equipa antes de uma operação especial.", difficulty: "Fácil", icon: <Shield size={20} />, xp: 100 },
    { title: "Negociação de Crise", description: "Gerir situação de crise com reféns, coordenando equipas e negociação.", difficulty: "Difícil", icon: <Crosshair size={20} />, xp: 300 },
    { title: "Supervisão de Patrulha", description: "Supervisionar patrulha de agentes, avaliando desempenho e corrigindo procedimentos.", difficulty: "Média", icon: <Target size={20} />, xp: 150 },
  ],
  oficial: [
    { title: "Planeamento Estratégico", description: "Desenvolver plano estratégico para operação de larga escala envolvendo múltiplas unidades.", difficulty: "Difícil", icon: <Target size={20} />, xp: 400 },
    { title: "Inspeção de Unidade", description: "Realizar inspeção completa a uma unidade operacional, avaliando prontidão e recursos.", difficulty: "Média", icon: <Shield size={20} />, xp: 250 },
    { title: "Operação Interagências", description: "Coordenar operação conjunta com outras forças de segurança.", difficulty: "Difícil", icon: <Users size={20} />, xp: 400 },
    { title: "Revisão Disciplinar", description: "Conduzir processo de revisão disciplinar e elaborar parecer fundamentado.", difficulty: "Média", icon: <AlertTriangle size={20} />, xp: 250 },
    { title: "Comando de Crise", description: "Assumir comando total numa situação de crise de grande escala com múltiplas equipas.", difficulty: "Difícil", icon: <Crosshair size={20} />, xp: 400 },
    { title: "Formação Tática", description: "Planear e conduzir sessão de formação tática para chefes e agentes.", difficulty: "Média", icon: <MapPin size={20} />, xp: 250 },
  ],
};

const DIFF_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  "Fácil": { color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)", border: "hsl(var(--success) / 0.3)", label: "FÁCIL" },
  "Média": { color: "hsl(43 90% 52%)", bg: "hsl(43 90% 52% / 0.1)", border: "hsl(43 90% 52% / 0.3)", label: "MÉDIA" },
  "Difícil": { color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)", border: "hsl(var(--destructive) / 0.3)", label: "DIFÍCIL" },
};

const TIER_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
  agente: { label: "Agente", color: "hsl(200 70% 55%)", gradient: "linear-gradient(135deg, hsl(200 70% 55%), hsl(210 60% 45%))" },
  chefe: { label: "Chefe", color: "hsl(43 90% 52%)", gradient: "linear-gradient(135deg, hsl(43 90% 52%), hsl(38 85% 42%))" },
  oficial: { label: "Oficial", color: "hsl(280 60% 60%)", gradient: "linear-gradient(135deg, hsl(280 60% 60%), hsl(260 50% 50%))" },
};

interface FileAttachment {
  name: string;
  type: string;
  data: string;
}

export default function Missoes() {
  const { currentUser, registrarLog } = useAuth();
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [companions, setCompanions] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [history, setHistory] = useState<{ mission: string; time: string; xp: number }[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [spinning, setSpinning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tier = currentUser ? getCareerTier(currentUser.role) : "agente";
  const tierConfig = TIER_CONFIG[tier];
  const pool = MISSIONS[tier];
  const totalXP = history.reduce((sum, h) => sum + h.xp, 0);

  const rollMission = () => {
    setCompleted(false);
    setAttachments([]);
    setSpinning(true);
    
    let count = 0;
    const interval = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setCurrentMission(rand);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
    setCompanions("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) return; // 5MB max
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const completeMission = async () => {
    if (!currentMission || !currentUser) return;
    setCompleting(true);
    try {
      await addDoc(collection(db, "mission_logs"), {
        usuario: currentUser.username,
        cargo: currentUser.role,
        missao: currentMission.title,
        descricao: currentMission.description,
        dificuldade: currentMission.difficulty,
        xp: currentMission.xp,
        acompanhados: companions.trim() || "Solo",
        tier: tierConfig.label,
        anexos: attachments.map(a => ({ name: a.name, type: a.type, data: a.data })),
        timestamp: serverTimestamp(),
        data: new Date().toLocaleDateString("pt-PT"),
        hora: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      });
      await registrarLog(`Completou missão: ${currentMission.title} (${currentMission.difficulty}) +${currentMission.xp}XP`);
      setHistory(prev => [{ mission: currentMission.title, time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), xp: currentMission.xp }, ...prev.slice(0, 4)]);
      setCompleted(true);
    } catch (e) {
      console.error(e);
    }
    setCompleting(false);
  };

  useEffect(() => { rollMission(); }, []);

  const diffConfig = currentMission ? DIFF_CONFIG[currentMission.difficulty] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="psp-card overflow-hidden relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--gold) / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--gold) / 0.15) 0%, transparent 50%)"
        }} />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                style={{ background: tierConfig.gradient, boxShadow: `0 0 30px ${tierConfig.color}40` }}>
                <Target size={26} className="text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: "hsl(var(--background))", color: tierConfig.color, border: `2px solid ${tierConfig.color}` }}>
                  <Zap size={10} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wide" style={{ color: "hsl(var(--foreground))", fontFamily: "Rajdhani, sans-serif" }}>
                  Sistema de Missões
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" 
                    style={{ background: `${tierConfig.color}20`, color: tierConfig.color, border: `1px solid ${tierConfig.color}40` }}>
                    {tierConfig.label}
                  </span>
                  {totalXP > 0 && (
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "hsl(var(--gold))" }}>
                      <Star size={12} fill="currentColor" /> {totalXP} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={rollMission} disabled={spinning}
              className="btn-gold flex items-center gap-2 text-base px-6 py-3 rounded-xl"
              style={{ boxShadow: "var(--shadow-gold)" }}>
              <Shuffle size={18} className={spinning ? "animate-spin" : ""} />
              Sortear Missão
            </button>
          </div>
        </div>
      </div>

      {/* Active Mission */}
      {currentMission && diffConfig && (
        <div className="relative" style={{ animation: spinning ? "none" : "fadeIn 0.5s ease" }}>
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-xl opacity-20 blur-xl" style={{ background: diffConfig.color }} />
          
          <div className="psp-card relative overflow-hidden rounded-xl">
            {/* Top accent bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${diffConfig.color}, transparent)` }} />
            
            <div className="p-6 sm:p-8 space-y-6">
              {/* Mission header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: diffConfig.bg, color: diffConfig.color, border: `1px solid ${diffConfig.border}` }}>
                    {currentMission.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                        {currentMission.title}
                      </h2>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: diffConfig.bg, color: diffConfig.color, border: `1px solid ${diffConfig.border}` }}>
                        {diffConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={13} style={{ color: "hsl(var(--gold))" }} fill="hsl(var(--gold))" />
                      <span className="text-sm font-semibold" style={{ color: "hsl(var(--gold))" }}>+{currentMission.xp} XP</span>
                    </div>
                  </div>
                </div>
                {completed && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }}>
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif" }}>Concluída</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg" style={{ background: "hsl(var(--secondary) / 0.5)", borderLeft: `3px solid ${diffConfig.color}` }}>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {currentMission.description}
                </p>
              </div>

              {/* Form fields */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Companions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
                    <Users size={14} />
                    Acompanhados
                  </label>
                  <input
                    type="text"
                    className="psp-input rounded-lg"
                    placeholder="Nomes dos acompanhantes..."
                    value={companions}
                    onChange={(e) => setCompanions(e.target.value)}
                    disabled={completed}
                  />
                </div>

                {/* File upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
                    <Upload size={14} />
                    Anexos (máx. 5MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={completed}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={completed}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ 
                      background: "hsl(var(--secondary))", 
                      color: "hsl(var(--muted-foreground))",
                      border: "1px dashed hsl(var(--border))",
                      cursor: completed ? "not-allowed" : "pointer"
                    }}>
                    <Upload size={14} />
                    Adicionar Ficheiros
                  </button>
                </div>
              </div>

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden"
                      style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                      {att.type.startsWith("image/") ? (
                        <img src={att.data} alt={att.name} className="w-20 h-20 object-cover" />
                      ) : (
                        <div className="w-20 h-20 flex flex-col items-center justify-center gap-1 px-1">
                          <FileText size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                          <span className="text-[9px] text-center truncate w-full" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {att.name}
                          </span>
                        </div>
                      )}
                      {!completed && (
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "hsl(var(--destructive))", color: "white" }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Complete button */}
              {!completed && (
                <button onClick={completeMission} disabled={completing || spinning}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold uppercase tracking-wider transition-all"
                  style={{ 
                    background: completing ? "hsl(var(--secondary))" : `linear-gradient(135deg, ${diffConfig.color}, ${diffConfig.color}cc)`,
                    color: "white",
                    fontFamily: "Rajdhani, sans-serif",
                    boxShadow: completing ? "none" : `0 0 25px ${diffConfig.color}40`,
                    opacity: completing ? 0.7 : 1,
                  }}>
                  <CheckCircle2 size={20} />
                  {completing ? "A registar missão..." : "Concluir Missão"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mission Pool */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif" }}>
            <Crosshair size={14} />
            Todas as Missões — {tierConfig.label}
          </h3>
          <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pool.map((m, i) => {
            const dc = DIFF_CONFIG[m.difficulty];
            const isActive = currentMission?.title === m.title;
            return (
              <div key={i}
                onClick={() => { if (!spinning) { setCurrentMission(m); setCompleted(false); setCompanions(""); setAttachments([]); } }}
                className="psp-card p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{ 
                  borderLeft: `3px solid ${isActive ? dc.color : "transparent"}`,
                  background: isActive ? `hsl(var(--card))` : undefined,
                  boxShadow: isActive ? `inset 0 0 30px ${dc.color}10, 0 0 15px ${dc.color}10` : undefined,
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: dc.bg, color: dc.color }}>
                    {m.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                      {m.title}
                    </div>
                    <div className="text-xs mt-1 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {m.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                        {dc.label}
                      </span>
                      <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "hsl(var(--gold))" }}>
                        <Star size={9} fill="currentColor" /> {m.xp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session History */}
      {history.length > 0 && (
        <div className="psp-card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
            <Clock size={13} />
            Histórico da Sessão
            <span className="ml-auto text-sm font-bold flex items-center gap-1">
              <Star size={12} fill="currentColor" /> {totalXP} XP
            </span>
          </h3>
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-2 px-3 rounded-lg"
                style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                <CheckCircle2 size={14} style={{ color: "hsl(var(--success))" }} />
                <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>{h.mission}</span>
                <span className="font-semibold flex items-center gap-0.5" style={{ color: "hsl(var(--gold))" }}>
                  +{h.xp} XP
                </span>
                <span className="ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
