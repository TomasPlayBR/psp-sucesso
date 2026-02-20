import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, orderBy, query, serverTimestamp, writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { isDiretor } from "@/lib/roles";
import { Users, Plus, Search, GripVertical, Pencil, Trash2, X, Check } from "lucide-react";

interface Membro {
  id: string;
  nome: string;
  idAgente: string;
  discord: string;
  patente: string;
  callsign: string;
  cursos: string;
  dataEntrada: string;
  ordem: number;
}

const PATENTES = [
  "Agente Provisório","Agente","Agente Principal","Agente Coordenador",
  "Chefe","Chefe Principal","Chefe Coordenador","Subcomissário","Comissário",
  "Subintendente","Intendente","Superintendente","Superintendente-Chefe",
  "Diretor Nacional Adjunto","Diretor Nacional"
];

export default function Hub() {
  const { currentUser, registrarLog } = useAuth();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", idAgente: "", patente: "", discord: "", callsign: "", dataEntrada: "", cursos: "" });
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const canEdit = currentUser && isDiretor(currentUser.role);

  useEffect(() => {
    const q = query(collection(db, "membros"), orderBy("ordem", "asc"));
    const unsub = onSnapshot(q, snap => {
      setMembros(snap.docs.map(d => ({ id: d.id, ...d.data() } as Membro)));
    });
    return unsub;
  }, []);

  const filtered = membros.filter(m =>
    [m.nome, m.idAgente, m.patente, m.callsign, m.discord].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const resetForm = () => {
    setForm({ nome: "", idAgente: "", patente: "", discord: "", callsign: "", dataEntrada: "", cursos: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.nome || !form.idAgente || !form.patente) {
      alert("Preenche os campos obrigatórios: Nome, ID e Patente!");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "membros", editingId), { ...form });
        await registrarLog(`Editou o membro: ${form.nome}`);
      } else {
        await addDoc(collection(db, "membros"), {
          ...form,
          dataEntrada: form.dataEntrada || new Date().toLocaleDateString("pt-PT"),
          timestamp: serverTimestamp(),
          ordem: 999,
        });
        await registrarLog(`Registou novo membro: ${form.nome}`);
      }
      resetForm();
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m: Membro) => {
    setForm({ nome: m.nome, idAgente: m.idAgente, patente: m.patente, discord: m.discord || "", callsign: m.callsign || "", dataEntrada: m.dataEntrada || "", cursos: m.cursos || "" });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (m: Membro) => {
    if (!confirm(`Remover o agente ${m.nome}?`)) return;
    await deleteDoc(doc(db, "membros", m.id));
    await registrarLog(`Removeu o membro: ${m.nome}`);
  };

  // Simple drag-and-drop reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...membros];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setMembros(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = async () => {
    setDragIdx(null);
    const batch = writeBatch(db);
    membros.forEach((m, i) => {
      batch.update(doc(db, "membros", m.id), { ordem: i });
    });
    await batch.commit();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(var(--gold))" }}>
            <Users size={22} /> Hub de Pessoal
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            {membros.length} agente{membros.length !== 1 ? "s" : ""} registado{membros.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              className="psp-input pl-9 w-56"
              placeholder="Pesquisar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2">
              <Plus size={14} />
              Novo Agente
            </button>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "hsl(220 40% 5% / 0.85)" }}>
          <div className="psp-card w-full max-w-md p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "hsl(var(--gold))" }}>
                {editingId ? "Editar Agente" : "Registar Novo Agente"}
              </h2>
              <button onClick={resetForm} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="gold-line mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Nome *", key: "nome", placeholder: "Nome completo" },
                { label: "ID/Passaporte *", key: "idAgente", placeholder: "ID" },
                { label: "Discord", key: "discord", placeholder: "Discord#0000" },
                { label: "Callsign", key: "callsign", placeholder: "ex: P-01" },
                { label: "Cursos", key: "cursos", placeholder: "ex: GOE, SEF..." },
                { label: "Data de Entrada", key: "dataEntrada", placeholder: "dd/mm/aaaa" },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className={key === "nome" ? "col-span-2" : ""}>
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
              <div className="col-span-2">
                <label className="block text-xs uppercase tracking-widest mb-1"
                  style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                  Patente *
                </label>
                <select
                  className="psp-input"
                  value={form.patente}
                  onChange={e => setForm(f => ({ ...f, patente: e.target.value }))}
                  style={{ background: "hsl(var(--input))" }}
                >
                  <option value="">Selecionar patente...</option>
                  {PATENTES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={resetForm} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <Check size={14} />
                {loading ? "A guardar..." : editingId ? "Atualizar" : "Registar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="psp-card overflow-x-auto">
        <table className="w-full text-sm" id="hubTable">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {canEdit && <th className="w-8 py-3" />}
              {["Nome", "ID", "Discord", "Patente", "Callsign", "Cursos", "Entrada", canEdit ? "Ações" : ""].filter(Boolean).map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest"
                  style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 9 : 8} className="text-center py-12"
                  style={{ color: "hsl(var(--muted-foreground))" }}>
                  Nenhum membro encontrado
                </td>
              </tr>
            ) : filtered.map((m, idx) => (
              <tr
                key={m.id}
                className="table-row-hover border-b"
                style={{ borderColor: "hsl(var(--border))", cursor: canEdit ? "grab" : "default" }}
                draggable={!!canEdit}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                {canEdit && (
                  <td className="pl-3">
                    <GripVertical size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                  </td>
                )}
                <td className="px-4 py-3 font-semibold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {m.nome}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.idAgente || "N/A"}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.discord || "N/A"}</td>
                <td className="px-4 py-3">
                  <span className="rank-badge">{m.patente || "N/A"}</span>
                </td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: "hsl(var(--gold))" }}>{m.callsign || "N/A"}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.cursos || "Nenhum"}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.dataEntrada || "N/A"}</td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(m)} className="btn-ghost p-1.5" title="Editar">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(m)} className="btn-danger p-1.5" title="Remover">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
