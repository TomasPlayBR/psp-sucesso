import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp
} from "firebase/firestore";
import {
  Lock, Unlock, Plus, Clock, User, Gavel, AlertTriangle, Package,
  Scale, FileText, X, ChevronDown, ChevronUp, Volume2, VolumeX, Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Detido {
  id: string;
  nome: string;
  crime: string;
  duracao: number; // minutes
  fimTimestamp: number; // epoch ms
  responsavel: string;
  cargoResponsavel: string;
  artigos: string;
  objetosApreendidos: string;
  direitoAdvogado: "sim" | "nao" | "solicitado";
  notas: string;
  criadoEm: string;
  horaEntrada: string;
}

const CRIMES = [
  "Difamação", 
  "Desacatos", 
  "Agressão", 
  "Sem CC",
  "Fuga às Autoridades", 
  "Modificações Ilegais", 
  "Condução Perigosa e/ou Negligente", 
  "Sinais luminosos", 
  "Conduzir sem habilitação", 
  "Poluição Sonora", 
  "Conduzir mota sem capacete",
  "Furto de uma viatura civil", 
  "Furto de uma viatura governamental", 
  "Assalto a um civil", 
  "Assalto a uma loja", 
  "Assalto a um banco",
  "Tentativa de homicídio de um civil", 
  "Tentativa de homicídio de um agente", 
  "Tentativa de Homicídio por negligência", 
  "Homicídio por negligência", 
  "Homicídio de um civil", 
  "Homicídio de um agente",
  "Posse de arma de baixo calibre s/licença", 
  "Posse de arma de médio calibre", 
  "Posse de arma de alto calibre", 
  "Tráfico de Armas (posse de 3+ armas)", 
  "Posse de dinheiro sujo", 
  "Posse de substâncias ilegais", 
  "Tráfico de substância controlada", 
  "Plantação de marijuana",
  "Uso indevido de uma arma de fogo com licença", 
  "Desobediência às forças policiais", 
  "Desobediência ao tribunal", 
  "Perjúrio", 
  "Utilização indevida do Serviço de Emergência", 
  "Provocação intencional das autoridades reincidente", 
  "Fuga ao fisco", 
  "Pesca em zonas proibidas"
];

const DURACOES = [
  { label: "5 minutos", value: 5 },
  { label: "10 minutos", value: 10 },
  { label: "15 minutos", value: 15 },
  { label: "20 minutos", value: 20 },
  { label: "25 minutos", value: 25 },
  { label: "30 minutos", value: 30 },
  { label: "35 minutos", value: 35 },
  { label: "45 minutos", value: 45 },
  { label: "60 minutos", value: 60 },
];

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTimerState(remaining: number): "normal" | "warning" | "expired" {
  if (remaining <= 0) return "expired";
  if (remaining <= 2 * 60 * 1000) return "warning";
  return "normal";
}

const TIMER_COLORS = {
  normal: { color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)", border: "hsl(var(--success) / 0.3)" },
  warning: { color: "hsl(43 90% 52%)", bg: "hsl(43 90% 52% / 0.1)", border: "hsl(43 90% 52% / 0.3)" },
  expired: { color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.15)", border: "hsl(var(--destructive) / 0.4)" },
};

export default function Detidos() {
  const { currentUser, registrarLog } = useAuth();
  const [detidos, setDetidos] = useState<Detido[]>([]);
  const [now, setNow] = useState(Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const alertedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form
  const [fNome, setFNome] = useState("");
  const [fCrime, setFCrime] = useState("");
  const [fDuracao, setFDuracao] = useState(30);
  const [fArtigos, setFArtigos] = useState("");
  const [fObjetos, setFObjetos] = useState("");
  const [fAdvogado, setFAdvogado] = useState<"sim" | "nao" | "solicitado">("nao");
  const [fNotas, setFNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "detidos"), orderBy("fimTimestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setDetidos(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          nome: data.nome || "",
          crime: data.crime || "",
          duracao: data.duracao || 30,
          fimTimestamp: data.fimTimestamp || 0,
          responsavel: data.responsavel || "",
          cargoResponsavel: data.cargoResponsavel || "",
          artigos: data.artigos || "",
          objetosApreendidos: data.objetosApreendidos || "",
          direitoAdvogado: data.direitoAdvogado || "nao",
          notas: data.notas || "",
          criadoEm: data.criadoEm || "",
          horaEntrada: data.horaEntrada || "",
        };
      }));
    });
    return () => unsub();
  }, []);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Sound alert for expired
  useEffect(() => {
    useEffect(() => {
  if (!soundEnabled) return;

  // Função que verifica se há alguém expirado e toca o som
  const checkAndPlaySound = () => {
    const temExpirados = detidos.some(d => d.fimTimestamp - Date.now() <= 0);
    
    if (temExpirados) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = 880; // Frequência do "bipe"
        osc.type = "square";
        gain.gain.value = 0.1; // Volume
        
        osc.start();
        // O som dura 300ms
        setTimeout(() => { 
          osc.stop(); 
          ctx.close(); 
        }, 300);
      } catch (e) {
        console.error("Erro ao reproduzir som:", e);
      }
    }
  };

  // Toca o som a cada 2 segundos se houver detidos expirados
  const soundInterval = setInterval(checkAndPlaySound, 2000);

  return () => clearInterval(soundInterval);
}, [detidos, soundEnabled]);
  const resetForm = () => {
    setFNome(""); setFCrime(""); setFDuracao(30);
    setFArtigos(""); setFObjetos(""); setFAdvogado("nao");
    setFFianca(""); setFNotas("");
  };

  const handleSubmit = async () => {
    if (!fNome.trim() || !fCrime || !currentUser) return;
    setSubmitting(true);
    try {
      const agora = Date.now();
      const fim = agora + fDuracao * 60 * 1000;
      const now = new Date();
      await addDoc(collection(db, "detidos"), {
        nome: fNome.trim(),
        crime: fCrime,
        duracao: fDuracao,
        fimTimestamp: fim,
        responsavel: currentUser.username,
        cargoResponsavel: currentUser.role,
        artigos: fArtigos.trim(),
        objetosApreendidos: fObjetos.trim(),
        direitoAdvogado: fAdvogado,
        notas: fNotas.trim(),
        criadoEm: now.toLocaleDateString("pt-PT"),
        horaEntrada: now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        timestamp: serverTimestamp(),
      });
      await registrarLog(`Registou detido: ${fNome.trim()} — ${fCrime} (${fDuracao}min)`);
      resetForm();
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleRelease = async (d: Detido) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "detidos", d.id));
      await registrarLog(`Libertou detido: ${d.nome} — ${d.crime}`);
      alertedRef.current.delete(d.id);
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = detidos.filter(d => d.fimTimestamp - now > 0).length;
  const expiredCount = detidos.filter(d => d.fimTimestamp - now <= 0).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="psp-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.2) 0%, transparent 50%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold) / 0.7))", boxShadow: "0 0 25px hsl(var(--gold) / 0.3)" }}>
              <Lock size={24} style={{ color: "hsl(var(--background))" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest"
                style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                Registro de Detenção
              </h1>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Painel de controlo de custódia em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold"
                style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }}>
                {activeCount} Ativo{activeCount !== 1 ? "s" : ""}
              </span>
              {expiredCount > 0 && (
                <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold animate-pulse"
                  style={{ background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.4)" }}>
                  {expiredCount} Para Libertar
                </span>
              )}
            </div>

            {/* Sound toggle */}
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: "hsl(var(--secondary))", color: soundEnabled ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Add detido */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="btn-gold flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl"
                  style={{ boxShadow: "var(--shadow-gold)" }}>
                  <Plus size={14} />
                  Registar Detido
                </button>
              </DialogTrigger>
              <DialogContent className="psp-card max-w-lg max-h-[90vh] overflow-y-auto"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold uppercase tracking-widest"
                    style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                    Novo Detido
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  {/* Nome */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Nome do Detido *</label>
                    <Input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Nome IC do civil..."
                      maxLength={80} className="psp-input" />
                  </div>

                  {/* Crime */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Crime Principal *</label>
                    <Select value={fCrime} onValueChange={setFCrime}>
                      <SelectTrigger className="psp-input">
                        <SelectValue placeholder="Selecionar crime..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CRIMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duração */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Tempo de Detenção *</label>
                    <Select value={String(fDuracao)} onValueChange={v => setFDuracao(Number(v))}>
                      <SelectTrigger className="psp-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURACOES.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: "hsl(var(--border))" }}>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-3"
                      style={{ color: "hsl(var(--gold) / 0.7)" }}>Ficha de Detido (opcional)</p>

                    {/* Artigos */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Artigos Infringidos</label>
                      <Input value={fArtigos} onChange={e => setFArtigos(e.target.value)}
                        placeholder="Ex: Art. 1 Lei 1, Art. 3 lei 5..." maxLength={200} className="psp-input" />
                    </div>

                    {/* Objetos */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Objetos Apreendidos</label>
                      <Input value={fObjetos} onChange={e => setFObjetos(e.target.value)}
                        placeholder="Ex: 1x Glock, 50 Metas..." maxLength={200} className="psp-input" />
                    </div>

                    {/* Advogado */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Direito a Advogado</label>
                      <Select value={fAdvogado} onValueChange={v => setFAdvogado(v as any)}>
                        <SelectTrigger className="psp-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao">Não solicitado</SelectItem>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="solicitado">Já solicitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Notas Adicionais</label>
                      <Textarea value={fNotas} onChange={e => setFNotas(e.target.value)}
                        placeholder="Observações relevantes..." maxLength={500} rows={3} className="psp-input" />
                    </div>
                  </div>

                  <Button onClick={handleSubmit}
                    disabled={submitting || !fNome.trim() || !fCrime}
                    className="w-full font-bold uppercase tracking-widest text-xs py-3"
                    style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontFamily: "Rajdhani, sans-serif" }}>
                    {submitting ? "A registar..." : "Registar na Cela"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Grid de Celas */}
      {detidos.length === 0 ? (
        <div className="psp-card p-12 text-center">
          <Lock size={40} className="mx-auto mb-3 opacity-20" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Nenhum detido nas celas de momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {detidos.map((d, i) => {
            const remaining = d.fimTimestamp - now;
            const state = getTimerState(remaining);
            const tc = TIMER_COLORS[state];
            const isExpanded = expandedId === d.id;
            const progress = Math.max(0, Math.min(100, (remaining / (d.duracao * 60 * 1000)) * 100));

            return (
              <div key={d.id}
                className={`psp-card overflow-hidden transition-all duration-300 ${state === "expired" ? "animate-pulse" : ""}`}
                style={{
                  borderColor: tc.border,
                  boxShadow: state === "expired" ? `0 0 25px hsl(var(--destructive) / 0.2), inset 0 0 20px hsl(var(--destructive) / 0.05)` : undefined,
                }}>
                {/* Cell header */}
                <div className="px-4 py-2 flex items-center justify-between"
                  style={{ background: tc.bg, borderBottom: `1px solid ${tc.border}` }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: tc.color }}>
                    Cela {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock size={12} style={{ color: tc.color }} />
                    <span className="text-sm font-mono font-bold" style={{ color: tc.color }}>
                      {formatCountdown(remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1" style={{ background: "hsl(var(--secondary))" }}>
                  <div className="h-full transition-all duration-1000"
                    style={{ width: `${progress}%`, background: tc.color }} />
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: tc.bg, border: `1px solid ${tc.border}` }}>
                      <User size={18} style={{ color: tc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate"
                        style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                        {d.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" }}>
                          {d.crime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Responsavel */}
                  <div className="flex items-center gap-2 text-[10px]"
                    style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Shield size={10} />
                    <span>{d.responsavel}</span>
                    <span className="opacity-50">·</span>
                    <span>{d.cargoResponsavel}</span>
                    <span className="opacity-50">·</span>
                    <span>{d.horaEntrada}</span>
                  </div>

                  {/* Expand/collapse ficha */}
                  <button onClick={() => setExpandedId(isExpanded ? null : d.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[10px] uppercase tracking-widest font-semibold transition-colors"
                    style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                    <FileText size={10} />
                    {isExpanded ? "Fechar Ficha" : "Ver Ficha"}
                    {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 p-3 rounded-lg text-xs"
                      style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border))" }}>
                      {d.artigos && (
                        <div className="flex gap-2">
                          <Gavel size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Artigos</span>
                            <span style={{ color: "hsl(var(--foreground))" }}>{d.artigos}</span>
                          </div>
                        </div>
                      )}
                      {d.objetosApreendidos && (
                        <div className="flex gap-2">
                          <Package size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Objetos Apreendidos</span>
                            <span style={{ color: "hsl(var(--foreground))" }}>{d.objetosApreendidos}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Scale size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Advogado</span>
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {d.direitoAdvogado === "sim" ? "Sim" : d.direitoAdvogado === "solicitado" ? "Já solicitado" : "Não solicitado"}
                          </span>
                        </div>
                      </div>
                      {d.fianca && (
                        <div className="flex gap-2">
                          <FileText size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Fiança</span>
                            <span style={{ color: "hsl(var(--foreground))" }}>{d.fianca}</span>
                          </div>
                        </div>
                      )}
                      {d.notas && (
                        <div className="flex gap-2">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Notas</span>
                            <span style={{ color: "hsl(var(--foreground))" }}>{d.notas}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Release button */}
                  {state === "expired" && (
                    <button onClick={() => handleRelease(d)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.8))",
                        color: "white",
                        fontFamily: "Rajdhani, sans-serif",
                        boxShadow: "0 0 20px hsl(var(--destructive) / 0.3)",
                      }}>
                      <Unlock size={14} />
                      Libertar Detido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
