import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import {
  Lock, Unlock, Plus, User, Gavel, AlertTriangle, Package,
  Scale, FileText, ChevronDown, ChevronUp, Shield
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
  "Assalto a Loja",
  "Assalto a Banco",
  "Roubo de Veículo",
  "Condução Perigosa",
  "Porte Ilegal de Arma",
  "Tráfico de Droga",
  "Homicídio",
  "Tentativa de Homicídio",
  "Agressão",
  "Sequestro",
  "Fuga as autoridades",
  "Desacato à Autoridade",
  "Vandalismo",
  "Posse de Objetos Ilegais",
  "Outro",
];

export default function Detidos() {
  const { currentUser, registrarLog } = useAuth();
  const [detidos, setDetidos] = useState<Detido[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form
  const [fNome, setFNome] = useState("");
  const [fCrimes, setFCrimes] = useState<string[]>([]);
  const [fArtigos, setFArtigos] = useState("");
  const [fObjetos, setFObjetos] = useState("");
  const [fAdvogado, setFAdvogado] = useState<"sim" | "nao" | "solicitado">("nao");
  const [fNotas, setFNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, "detidos"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDetidos(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          nome: data.nome || "",
          crime: data.crime || "",
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

  const resetForm = () => {
    setFNome(""); setFCrimes([]);
    setFArtigos(""); setFObjetos(""); setFAdvogado("nao");
    setFNotas("");
  };

  const handleSubmit = async () => {
    if (!fNome.trim() || fCrimes.length === 0 || !currentUser) return;
    setSubmitting(true);
    try {
      const now = new Date();
      await addDoc(collection(db, "detidos"), {
        nome: fNome.trim(),
        crime: fCrimes.join(", "),
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
      await registrarLog(`Registou detido: ${fNome.trim()} — ${fCrimes.join(", ")}`);
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
    } catch (e) {
      console.error(e);
    }
  };

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
                Gestão de Detidos
              </h1>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Registo e controlo manual de custódia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

                  {/* Crimes - Multi-select */}
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

                  <div className="border-t pt-4" style={{ borderColor: "hsl(var(--border))" }}>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-3"
                      style={{ color: "hsl(var(--gold) / 0.7)" }}>Ficha de Detido (opcional)</p>

                    {/* Artigos */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Artigos Infringidos</label>
                      <Input value={fArtigos} onChange={e => setFArtigos(e.target.value)}
                        placeholder="Ex: Art. 210º, Art. 143º..." maxLength={200} className="psp-input" />
                    </div>

                    {/* Objetos */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Objetos Apreendidos</label>
                      <Input value={fObjetos} onChange={e => setFObjetos(e.target.value)}
                        placeholder="Ex: 1x Glock, 50g de Erva..." maxLength={200} className="psp-input" />
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
            const isExpanded = expandedId === d.id;

            return (
              <div key={d.id}
                className="psp-card overflow-hidden transition-all duration-300"
                style={{
                  borderColor: "hsl(var(--border))",
                }}>
                {/* Cell header */}
                <div className="px-4 py-2 flex items-center justify-between"
                  style={{ background: "hsl(var(--secondary) / 0.5)", borderBottom: "1px solid hsl(var(--border))" }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "hsl(var(--gold))" }}>
                    Cela {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest"
                    style={{ color: "hsl(var(--muted-foreground))" }}>
                    Entrada {d.horaEntrada}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                      <User size={18} style={{ color: "hsl(var(--gold))" }} />
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
