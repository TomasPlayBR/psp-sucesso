import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle } from "lucide-react";
import emblem from "@/assets/psp-logo.png";

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

const dangerStyle = (nivel: string) => {
  switch (nivel) {
    case "Extremo": return { bg: "hsl(0 70% 50% / 0.15)", color: "hsl(0 70% 65%)", border: "hsl(0 70% 50% / 0.4)" };
    case "Alto": return { bg: "hsl(25 90% 50% / 0.15)", color: "hsl(25 90% 65%)", border: "hsl(25 90% 50% / 0.4)" };
    case "Médio": return { bg: "hsl(43 90% 52% / 0.15)", color: "hsl(43 90% 60%)", border: "hsl(43 90% 52% / 0.4)" };
    default: return { bg: "hsl(145 60% 40% / 0.15)", color: "hsl(145 60% 55%)", border: "hsl(145 60% 40% / 0.4)" };
  }
};

export default function BlacklistPublica() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "blacklist"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => ({ id: d.id, id_: d.data().id, ...d.data() } as BlacklistEntry)));
    });
    return unsub;
  }, []);

  const filtered = entries.filter(e =>
    [e.nome, e.id_, e.motivo, e.perigo].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

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
                Blacklist Pública
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/junta-te" className="btn-ghost text-sm">Junta-te a Nós</a>
            <a href="/login" className="btn-gold text-sm">Login PSP</a>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"
                style={{ color: "hsl(var(--destructive))" }}>
                <AlertTriangle size={22} /> Blacklist Ativa
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                {entries.length} registo{entries.length !== 1 ? "s" : ""} — Consulta pública
              </p>
            </div>
            <input
              className="psp-input w-56"
              placeholder="Pesquisar nome, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="psp-card p-12 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3"
                style={{ color: "hsl(var(--muted-foreground))" }} />
              <p style={{ color: "hsl(var(--muted-foreground))" }}>Nenhum registo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(entry => {
                const ds = dangerStyle(entry.perigo);
                return (
                  <div key={entry.id} className="psp-card p-4 fade-in"
                    style={{ borderColor: ds.border }}>
                    <div className="flex items-center mb-3">
                      <span className="danger-badge"
                        style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>
                        🚨 {entry.perigo}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1"
                      style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
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

          <p className="text-center text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            © 2026 PSP — Sucesso Roleplay — TomasPlayBR
          </p>
        </div>
      </main>
    </div>
  );
}
