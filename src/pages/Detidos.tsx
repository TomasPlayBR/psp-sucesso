import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import {
  Lock, Unlock, Plus, User, Gavel, AlertTriangle, Package,
  Scale, FileText, Search, ChevronDown, Shield, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { isSuperior } from "@/lib/roles";

interface Detido {
  id: string;
  nome: string;
  crime: string;
  duracao: number;
  fimTimestamp: number;
  responsavel: string;
  cargoResponsavel: string;
  artigos: string;
  objetosApreendidos: string;
  direitoAdvogado: "sim" | "nao" | "solicitado";
  fianca: string;
  notas: string;
  criadoEm: string;
  horaEntrada: string;
}

const CRIMES = [
  "Assalto a Loja", "Assalto a Banco", "Roubo de Veículo", "Condução Perigosa",
  "Porte Ilegal de Arma", "Tráfico de Droga", "Homicídio", "Tentativa de Homicídio",
  "Agressão", "Sequestro", "Evasão à Polícia", "Desacato à Autoridade",
  "Vandalismo", "Posse de Objetos Ilegais", "Outro",
];

const DURACOES = [
  { label: "10 minutos", value: 10 },
  { label: "15 minutos", value: 15 },
  { label: "20 minutos", value: 20 },
  { label: "30 minutos", value: 30 },
  { label: "45 minutos", value: 45 },
  { label: "60 minutos", value: 60 },
];

export default function Detidos() {
  const { currentUser, registrarLog } = useAuth();
  const [detidos, setDetidos] = useState<Detido[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  // Form
  const [fNome, setFNome] = useState("");
  const [fCrimes, setFCrimes] = useState<string[]>([]);
  const [fDuracao, setFDuracao] = useState(30);
  const [fArtigos, setFArtigos] = useState("");
  const [fObjetos, setFObjetos] = useState("");
  const [fAdvogado, setFAdvogado] = useState<"sim" | "nao" | "solicitado">("nao");
  const [fFianca, setFFianca] = useState("");
  const [fNotas, setFNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canRemove = currentUser && isSuperior(currentUser.role);

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
          fianca: data.fianca || "",
          notas: data.notas || "",
          criadoEm: data.criadoEm || "",
          horaEntrada: data.horaEntrada || "",
        };
      }));
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setFNome(""); setFCrimes([]); setFDuracao(30);
    setFArtigos(""); setFObjetos(""); setFAdvogado("nao");
    setFFianca(""); setFNotas("");
  };

  const handleSubmit = async () => {
    if (!fNome.trim() || fCrimes.length === 0 || !currentUser) return;
    setSubmitting(true);
    try {
      const agora = Date.now();
      const fim = agora + fDuracao * 60 * 1000;
      const now = new Date();
      await addDoc(collection(db, "detidos"), {
        nome: fNome.trim(),
        crime: fCrimes.join(", "),
        duracao: fDuracao,
        fimTimestamp: fim,
        responsavel: currentUser.username,
        cargoResponsavel: currentUser.role,
        artigos: fArtigos.trim(),
        objetosApreendidos: fObjetos.trim(),
        direitoAdvogado: fAdvogado,
        fianca: fFianca.trim(),
        notas: fNotas.trim(),
        criadoEm: now.toLocaleDateString("pt-PT"),
        horaEntrada: now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        timestamp: serverTimestamp(),
      });
      await registrarLog(`Registou detido: ${fNome.trim()} — ${fCrimes.join(", ")} (${fDuracao}min)`);
      resetForm();
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleRelease = async (d: Detido) => {
    if (!currentUser) return;
    setRemoving(d.id);
    try {
      await deleteDoc(doc(db, "detidos", d.id));
      await registrarLog(`Libertou detido: ${d.nome} — ${d.crime}`);
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(null);
    }
  };

  const filtered = detidos.filter(d => {
    if (!search) return true;
    return [d.nome, d.crime, d.responsavel, d.artigos]
      .some(f => f.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="psp-card p-6" style={{ borderColor: "hsl(var(--gold) / 0.2)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold) / 0.7))", boxShadow: "0 0 25px hsl(var(--gold) / 0.3)" }}>
              <Lock size={24} style={{ color: "hsl(var(--background))" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                Gestão de Detidos
              </h1>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {detidos.length} registo{detidos.length !== 1 ? "s" : ""} ativos
              </p>
            </div>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              className="psp-input pl-9"
              placeholder="Pesquisar por nome, crime, responsável..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-gold flex items-center gap-2 whitespace-nowrap">
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
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                    style={{ color: "hsl(var(--muted-foreground))" }}>Nome do Detido *</label>
                  <Input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Nome IC do civil..."
                    maxLength={80} className="psp-input" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                    style={{ color: "hsl(var(--muted-foreground))" }}>Crimes * ({fCrimes.length} selecionado{fCrimes.length !== 1 ? "s" : ""})</label>
                  <div className="grid grid-cols-2 gap-1.5 p-3 rounded-lg max-h-48 overflow-y-auto"
                    style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border))" }}>
                    {CRIMES.map(c => {
                      const checked = fCrimes.includes(c);
                      return (
                        <label key={c}
                          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs"
                          style={{
                            background: checked ? "hsl(var(--gold) / 0.1)" : "transparent",
                            color: checked ? "hsl(var(--gold))" : "hsl(var(--foreground))",
                          }}>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) setFCrimes(prev => [...prev, c]);
                              else setFCrimes(prev => prev.filter(x => x !== c));
                            }}
                          />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                </div>

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

                  <div className="mb-3">
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Artigos Infringidos</label>
                    <Input value={fArtigos} onChange={e => setFArtigos(e.target.value)}
                      placeholder="Ex: Art. 210º, Art. 143º..." maxLength={200} className="psp-input" />
                  </div>

                  <div className="mb-3">
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Objetos Apreendidos</label>
                    <Input value={fObjetos} onChange={e => setFObjetos(e.target.value)}
                      placeholder="Ex: 1x Glock, 50g de Erva..." maxLength={200} className="psp-input" />
                  </div>

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

                  <div className="mb-3">
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Fiança</label>
                    <Input value={fFianca} onChange={e => setFFianca(e.target.value)}
                      placeholder="Ex: $5.000 ou N/A" maxLength={50} className="psp-input" />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                      style={{ color: "hsl(var(--muted-foreground))" }}>Notas Adicionais</label>
                    <Textarea value={fNotas} onChange={e => setFNotas(e.target.value)}
                      placeholder="Observações relevantes..." maxLength={500} rows={3} className="psp-input" />
                  </div>
                </div>

                <Button onClick={handleSubmit}
                  disabled={submitting || !fNome.trim() || fCrimes.length === 0}
                  className="w-full font-bold uppercase tracking-widest text-xs py-3"
                  style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontFamily: "Rajdhani, sans-serif" }}>
                  {submitting ? "A registar..." : "Registar na Cela"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="psp-card p-12 text-center fade-in">
          <Lock size={36} className="mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif" }}>
            {search ? "Nenhum resultado encontrado" : "Nenhum detido nas celas de momento"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(d => {
            const isExpanded = expandedId === d.id;
            const crimes = d.crime.split(", ");
            return (
              <div key={d.id} className="psp-card overflow-hidden fade-in"
                style={{ borderColor: "hsl(var(--gold) / 0.15)" }}>
                {/* Post header */}
                <div className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold) / 0.6))" }}>
                    <Shield size={16} style={{ color: "hsl(var(--background))" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "hsl(var(--gold))" }}>
                      {d.responsavel}
                    </p>
                    <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {d.cargoResponsavel} · {d.criadoEm} às {d.horaEntrada}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: "hsl(var(--gold) / 0.1)", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.25)" }}>
                    {d.duracao} min
                  </span>
                </div>

                {/* Post body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Nome do detido */}
                  <div className="flex items-center gap-2">
                    <User size={16} style={{ color: "hsl(var(--foreground))" }} />
                    <h3 className="text-base font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                      {d.nome}
                    </h3>
                  </div>

                  {/* Crimes como tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {crimes.map((c, i) => (
                      <span key={i} className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.25)" }}>
                        {c.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Detalhes expandíveis */}
                  {(d.artigos || d.objetosApreendidos || d.fianca || d.notas) && (
                    <button onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-widest font-semibold transition-colors"
                      style={{ background: "hsl(var(--secondary) / 0.6)", color: "hsl(var(--muted-foreground))" }}>
                      <FileText size={10} />
                      {isExpanded ? "Fechar Ficha" : "Ver Ficha Completa"}
                      <ChevronDown size={10} className="transition-transform" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>
                  )}

                  {isExpanded && (
                    <div className="space-y-2.5 p-3.5 rounded-lg text-xs fade-in"
                      style={{ background: "hsl(var(--secondary) / 0.4)", border: "1px solid hsl(var(--border))" }}>
                      <div className="flex gap-2">
                        <Scale size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--gold))" }} />
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: "hsl(var(--gold) / 0.7)" }}>Advogado</span>
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {d.direitoAdvogado === "sim" ? "Sim" : d.direitoAdvogado === "solicitado" ? "Já solicitado" : "Não solicitado"}
                          </span>
                        </div>
                      </div>
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
                </div>

                {/* Post footer - libertar */}
                <div className="px-5 py-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                        style={{
                          background: "hsl(var(--destructive) / 0.08)",
                          color: "hsl(var(--destructive))",
                          border: "1px solid hsl(var(--destructive) / 0.2)",
                        }}
                        disabled={removing === d.id}
                      >
                        {removing === d.id ? (
                          <span className="animate-spin block w-3 h-3 border border-current border-t-transparent rounded-full" />
                        ) : (
                          <><Unlock size={12} /> Libertar Detido</>
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                      <AlertDialogHeader>
                        <AlertDialogTitle style={{ fontFamily: "Rajdhani, sans-serif" }}>Libertar Detido?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tens a certeza que queres libertar <strong>{d.nome}</strong>? Esta ação será registada nos logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRelease(d)}
                          style={{ background: "hsl(var(--destructive))", color: "#fff" }}
                        >
                          Sim, Libertar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
