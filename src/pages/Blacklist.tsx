import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { isSuperior } from "@/lib/roles";
import { AlertTriangle, Plus, X, Check, Trash2 } from "lucide-react";

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

const dangerStyle = (nivel: string) => {
  switch (nivel) {
    case "Extremo": return { bg: "hsl(0 70% 50% / 0.15)", color: "hsl(0 70% 65%)", border: "hsl(0 70% 50% / 0.4)" };
    case "Alto": return { bg: "hsl(25 90% 50% / 0.15)", color: "hsl(25 90% 65%)", border: "hsl(25 90% 50% / 0.4)" };
    case "Médio": return { bg: "hsl(43 90% 52% / 0.15)", color: "hsl(43 90% 60%)", border: "hsl(43 90% 52% / 0.4)" };
    default: return { bg: "hsl(145 60% 40% / 0.15)", color: "hsl(145 60% 55%)", border: "hsl(145 60% 40% / 0.4)" };
  }
};

export default function Blacklist() {
  const { currentUser, registrarLog } = useAuth();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", id: "", motivo: "", nivel: "Baixo" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "blacklist"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => ({ id: d.id, id_: d.data().id, ...d.data() } as BlacklistEntry)));
    });
    return unsub;
  }, []);

  const resetForm = () => {
    setForm({ nome: "", id: "", motivo: "", nivel: "Baixo" });
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.nome || !form.id || !form.motivo) {
      alert("Preenche todos os campos!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "blacklist"), {
        nome: form.nome,
        id: form.id,
        motivo: form.motivo,
        perigo: form.nivel,
        autor: currentUser?.username || "Sistema",
        data: new Date().toLocaleDateString("pt-PT"),
        hora: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        timestamp: serverTimestamp(),
      });
      await registrarLog(`Blacklist: Adicionou ${form.nome} (Nível: ${form.nivel})`);
      resetForm();
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entry: BlacklistEntry) => {
    if (!confirm(`Remover ${entry.nome} da Blacklist?`)) return;
    await deleteDoc(doc(db, "blacklist", entry.id));
    await registrarLog(`Removeu da Blacklist: ${entry.nome}`);
  };

  const canRemove = currentUser && isSuperior(currentUser.role);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(var(--destructive))" }}>
            <AlertTriangle size={22} /> Blacklist
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            {entries.length} registo{entries.length !== 1 ? "s" : ""} na blacklist
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2">
          <Plus size={14} />
          Novo Registo
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "hsl(220 40% 5% / 0.85)" }}>
          <div className="psp-card w-full max-w-md p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "hsl(var(--destructive))" }}>
                ⚠ Adicionar à Blacklist
              </h2>
              <button onClick={resetForm} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Nome", key: "nome", placeholder: "Nome completo" },
                { label: "ID / Passaporte", key: "id", placeholder: "ID" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-widest mb-1"
                    style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                    {label}
                  </label>
                  <input
                    className="psp-input"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1"
                  style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                  Motivo
                </label>
                <textarea
                  className="psp-input resize-none"
                  rows={3}
                  placeholder="Descreve o motivo..."
                  value={form.motivo}
                  onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1"
                  style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                  Nível de Perigo
                </label>
                <select
                  className="psp-input"
                  value={form.nivel}
                  onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                  style={{ background: "hsl(var(--input))" }}
                >
                  {DANGER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={resetForm} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <Check size={14} />
                {loading ? "A guardar..." : "Registar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {entries.length === 0 ? (
        <div className="psp-card p-12 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Nenhum registo na blacklist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(entry => {
            const ds = dangerStyle(entry.perigo);
            return (
              <div key={entry.id} className="psp-card p-4 fade-in relative"
                style={{ borderColor: ds.border }}>
                {/* Danger badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="danger-badge"
                    style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>
                    🚨 {entry.perigo}
                  </span>
                  {canRemove && (
                    <button onClick={() => handleRemove(entry)} className="btn-danger p-1.5" title="Remover">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {entry.nome}
                </h3>
                <p className="text-xs mb-1 font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>
                  ID: {entry.id_}
                </p>
                <p className="text-xs mb-3" style={{ color: "hsl(var(--foreground) / 0.7)" }}>
                  {entry.motivo}
                </p>
                <div className="text-[10px] pt-2"
                  style={{ borderTop: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                  Por: {entry.autor} — {entry.data} {entry.hora}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
