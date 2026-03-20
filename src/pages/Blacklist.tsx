import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { isSuperior } from "@/lib/roles";
import { AlertTriangle, Plus, X, Check, Trash2, Search, Shield, User, Clock, ChevronDown, FileWarning } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface BlacklistEntry {
  id: string;
  nome: string;
  id_: string;
  motivo: string;
  perigo: string;
  autor: string;
  data: string;
  hora: string;
}

const DANGER_LEVELS = ["Baixo", "Médio", "Alto", "Extremo"];

const dangerConfig: Record<string, { bg: string; text: string; border: string; icon: string; glow: string }> = {
  Extremo: { bg: "hsl(0 70% 50% / 0.12)", text: "hsl(0 70% 65%)", border: "hsl(0 70% 50% / 0.35)", icon: "🔴", glow: "hsl(0 70% 50% / 0.15)" },
  Alto: { bg: "hsl(25 90% 50% / 0.12)", text: "hsl(25 90% 65%)", border: "hsl(25 90% 50% / 0.35)", icon: "🟠", glow: "hsl(25 90% 50% / 0.1)" },
  Médio: { bg: "hsl(43 90% 52% / 0.12)", text: "hsl(43 90% 60%)", border: "hsl(43 90% 52% / 0.35)", icon: "🟡", glow: "hsl(43 90% 52% / 0.1)" },
  Baixo: { bg: "hsl(145 60% 40% / 0.12)", text: "hsl(145 60% 55%)", border: "hsl(145 60% 40% / 0.35)", icon: "🟢", glow: "hsl(145 60% 40% / 0.1)" },
};

const getDanger = (nivel: string) => dangerConfig[nivel] || dangerConfig.Baixo;

export default function Blacklist() {
  const { currentUser, registrarLog } = useAuth();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", id: "", motivo: "", nivel: "Baixo" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [removing, setRemoving] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canRemove = currentUser && isSuperior(currentUser.role);

  useEffect(() => {
    const q = query(collection(db, "blacklist"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          nome: data.nome || "",
          id_: data.id || "",
          motivo: data.motivo || "",
          perigo: data.perigo || "Baixo",
          autor: data.autor || "Sistema",
          data: data.data || "—",
          hora: data.hora || "—",
        };
      }));
    });
    return unsub;
  }, []);

  const filtered = entries.filter(e => {
    const matchesSearch = !search || [e.nome, e.id_, e.motivo, e.autor]
      .some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = filterLevel === "all" || e.perigo === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const resetForm = () => {
    setForm({ nome: "", id: "", motivo: "", nivel: "Baixo" });
    setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!form.nome.trim() || !form.id.trim() || !form.motivo.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "blacklist"), {
        nome: form.nome.trim(),
        id: form.id.trim(),
        motivo: form.motivo.trim(),
        perigo: form.nivel,
        autor: currentUser?.username || "Sistema",
        data: new Date().toLocaleDateString("pt-PT"),
        hora: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        timestamp: serverTimestamp(),
      });
      await registrarLog(`Blacklist: Adicionou ${form.nome} (Nível: ${form.nivel})`);
      resetForm();
    } catch (e: any) {
      console.error("Erro ao adicionar:", e);
      alert("Erro ao adicionar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entry: BlacklistEntry) => {
    setRemoving(entry.id);
    try {
      await deleteDoc(doc(db, "blacklist", entry.id));
      await registrarLog(`Removeu da Blacklist: ${entry.nome}`);
    } catch (e: any) {
      console.error("Erro ao remover:", e);
      alert("Erro ao remover: " + e.message);
    } finally {
      setRemoving(null);
    }
  };

  const countByLevel = (level: string) => entries.filter(e => e.perigo === level).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="psp-card p-6" style={{ borderColor: "hsl(var(--destructive) / 0.2)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(var(--destructive) / 0.12)", border: "1px solid hsl(var(--destructive) / 0.25)" }}>
              <FileWarning size={24} style={{ color: "hsl(var(--destructive))" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                Blacklist
              </h1>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {entries.length} registo{entries.length !== 1 ? "s" : ""} ativos
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {DANGER_LEVELS.map(level => {
              const count = countByLevel(level);
              const cfg = getDanger(level);
              return (
                <button
                  key={level}
                  onClick={() => setFilterLevel(filterLevel === level ? "all" : level)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: filterLevel === level ? cfg.bg : "transparent",
                    color: filterLevel === level ? cfg.text : "hsl(var(--muted-foreground))",
                    border: `1px solid ${filterLevel === level ? cfg.border : "hsl(var(--border))"}`,
                    fontFamily: "Rajdhani, sans-serif",
                  }}
                >
                  <span>{cfg.icon}</span>
                  {level}
                  <span className="ml-0.5 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              className="psp-input pl-9"
              placeholder="Pesquisar por nome, ID, motivo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-gold flex items-center gap-2 whitespace-nowrap">
                <Plus size={14} />
                Novo Registo
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--destructive))" }}>
                  <AlertTriangle size={18} /> Adicionar à Blacklist
                </DialogTitle>
                <DialogDescription style={{ color: "hsl(var(--muted-foreground))" }}>
                  Regista um novo infrator na blacklist da PSP.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Nome</label>
                  <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" maxLength={100} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>ID / Passaporte</label>
                  <Input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="ID do jogador" maxLength={20} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Motivo</label>
                  <Textarea value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Descreve o motivo..." maxLength={500} rows={3} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Nível de Perigo</label>
                  <Select value={form.nivel} onValueChange={v => setForm(f => ({ ...f, nivel: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DANGER_LEVELS.map(l => (
                        <SelectItem key={l} value={l}>
                          <span className="flex items-center gap-2">
                            <span>{getDanger(l).icon}</span> {l}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={resetForm} className="flex-1">Cancelar</Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !form.nome.trim() || !form.id.trim() || !form.motivo.trim()}
                    className="flex-1 font-bold"
                    style={{ background: "var(--gradient-gold)", color: "hsl(var(--primary-foreground))" }}
                  >
                    {loading ? "A guardar..." : "Registar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="psp-card p-12 text-center fade-in">
          <AlertTriangle size={36} className="mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif" }}>
            {search || filterLevel !== "all" ? "Nenhum resultado encontrado" : "Nenhum registo na blacklist"}
          </p>
        </div>
      ) : (
        <div className="psp-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "hsl(var(--secondary))", borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Perigo", "Nome", "ID", "Motivo", "Autor", "Data", ...(canRemove ? [""] : [])].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-semibold"
                      style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => {
                  const cfg = getDanger(entry.perigo);
                  return (
                    <tr
                      key={entry.id}
                      className="table-row-hover transition-colors"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid hsl(var(--border))" : "none",
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, fontFamily: "Rajdhani, sans-serif" }}>
                          {cfg.icon} {entry.perigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{entry.nome}</span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs px-2 py-0.5 rounded" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                          {entry.id_}
                        </code>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="text-xs line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{entry.motivo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--gold) / 0.8)" }}>
                          <User size={10} /> {entry.autor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Clock size={10} /> {entry.data} {entry.hora}
                        </span>
                      </td>
                      {canRemove && (
                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="btn-danger p-1.5 rounded"
                                disabled={removing === entry.id}
                                title="Remover da blacklist"
                              >
                                {removing === entry.id ? (
                                  <span className="animate-spin block w-3 h-3 border border-current border-t-transparent rounded-full" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                              <AlertDialogHeader>
                                <AlertDialogTitle style={{ fontFamily: "Rajdhani, sans-serif" }}>Remover da Blacklist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tens a certeza que queres remover <strong>{entry.nome}</strong> (ID: {entry.id_}) da blacklist? Esta ação será registada nos logs.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemove(entry)}
                                  style={{ background: "hsl(var(--destructive))", color: "#fff" }}
                                >
                                  Sim, Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {filtered.map(entry => {
              const cfg = getDanger(entry.perigo);
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="p-4 fade-in">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                        style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, fontFamily: "Rajdhani, sans-serif" }}>
                        {cfg.icon} {entry.perigo}
                      </span>
                      <span className="font-semibold text-sm truncate" style={{ color: "hsl(var(--foreground))" }}>{entry.nome}</span>
                    </div>
                    <ChevronDown size={14} className="shrink-0 transition-transform" style={{
                      color: "hsl(var(--muted-foreground))",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                    }} />
                  </button>
                  {isExpanded && (
                    <div className="mt-3 pl-2 space-y-2 fade-in">
                      <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <span className="font-semibold" style={{ color: "hsl(var(--foreground) / 0.7)" }}>ID:</span>{" "}
                        <code className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "hsl(var(--secondary))" }}>{entry.id_}</code>
                      </div>
                      <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <span className="font-semibold" style={{ color: "hsl(var(--foreground) / 0.7)" }}>Motivo:</span> {entry.motivo}
                      </div>
                      <div className="text-[10px] flex items-center gap-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <span className="flex items-center gap-1"><User size={10} style={{ color: "hsl(var(--gold) / 0.7)" }} /> {entry.autor}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {entry.data} {entry.hora}</span>
                      </div>
                      {canRemove && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="btn-danger text-[10px] mt-1 flex items-center gap-1.5" disabled={removing === entry.id}>
                              <Trash2 size={11} /> Remover
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                            <AlertDialogHeader>
                              <AlertDialogTitle style={{ fontFamily: "Rajdhani, sans-serif" }}>Remover da Blacklist?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remover <strong>{entry.nome}</strong> (ID: {entry.id_})?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemove(entry)} style={{ background: "hsl(var(--destructive))", color: "#fff" }}>
                                Sim, Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
