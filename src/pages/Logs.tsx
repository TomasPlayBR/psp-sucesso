import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScrollText, Clock, User, Briefcase, Activity } from "lucide-react";

interface LogEntry {
  id: string;
  usuario: string;
  cargo: string;
  acao: string;
  data: string;
  hora: string;
}

const cargoColor = (cargo: string) => {
  if (cargo === "Diretor Nacional") return "hsl(43 90% 52%)";
  if (["Diretor Nacional Adjunto", "Superintendente-Chefe", "Superintendente"].includes(cargo)) return "hsl(200 80% 60%)";
  if (["Intendente", "Subintendente", "Comissário", "Subcomissário"].includes(cargo)) return "hsl(145 60% 50%)";
  return "hsl(var(--muted-foreground))";
};

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as LogEntry)));
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(var(--gold))" }}>
          <ScrollText size={22} /> Registo de Atividade
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
          Últimas {logs.length} ações registadas
        </p>
      </div>

      <div className="psp-card overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 text-xs uppercase tracking-widest"
          style={{ background: "hsl(var(--secondary))", borderBottom: "1px solid hsl(var(--border))", fontFamily: "Rajdhani, sans-serif", fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>
          <div className="flex items-center gap-1.5"><Clock size={11} /> Data/Hora</div>
          <div className="flex items-center gap-1.5"><User size={11} /> Utilizador</div>
          <div className="flex items-center gap-1.5"><Briefcase size={11} /> Cargo</div>
          <div className="flex items-center gap-1.5"><Activity size={11} /> Ação</div>
        </div>
        <div className="divide-y divide-border">
          {logs.length === 0 ? (
            <div className="text-center py-12" style={{ color: "hsl(var(--muted-foreground))" }}>
              Nenhum registo de atividade
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="grid grid-cols-4 px-4 py-3 text-xs table-row-hover items-center">
              <div className="font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>
                {log.data} {log.hora}
              </div>
              <div className="font-semibold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                {log.usuario}
              </div>
              <div>
                <span className="rank-badge" style={{ color: cargoColor(log.cargo), borderColor: cargoColor(log.cargo) + "50", background: cargoColor(log.cargo) + "15" }}>
                  {log.cargo}
                </span>
              </div>
              <div style={{ color: "hsl(var(--foreground) / 0.8)" }}>{log.acao}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
