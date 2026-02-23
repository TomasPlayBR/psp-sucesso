import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { ScrollText, Target, Users, Clock, Filter, Star, Paperclip, Image as ImageIcon, FileText, X, ChevronDown, ChevronUp } from "lucide-react";

interface MissionLog {
  id: string;
  usuario: string;
  cargo: string;
  missao: string;
  descricao?: string;
  dificuldade: string;
  xp?: number;
  acompanhados: string;
  tier: string;
  data: string;
  hora: string;
  anexos?: { name: string; type: string; data: string }[];
}

const DIFF_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "Fácil": { color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.1)", border: "hsl(var(--success) / 0.3)" },
  "Média": { color: "hsl(43 90% 52%)", bg: "hsl(43 90% 52% / 0.1)", border: "hsl(43 90% 52% / 0.3)" },
  "Difícil": { color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)", border: "hsl(var(--destructive) / 0.3)" },
};

export default function MissionLogs() {
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [filterUser, setFilterUser] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "mission_logs"), orderBy("timestamp", "desc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as MissionLog)));
    });
    return unsub;
  }, []);

  const filtered = filterUser
    ? logs.filter(l => l.usuario.toLowerCase().includes(filterUser.toLowerCase()) || l.missao.toLowerCase().includes(filterUser.toLowerCase()))
    : logs;

  const stats = {
    total: logs.length,
    totalXP: logs.reduce((s, l) => s + (l.xp || 0), 0),
    easy: logs.filter(l => l.dificuldade === "Fácil").length,
    medium: logs.filter(l => l.dificuldade === "Média").length,
    hard: logs.filter(l => l.dificuldade === "Difícil").length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
            <X size={20} />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
        </div>
      )}

      {/* Header */}
      <div className="psp-card overflow-hidden relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.3) 0%, transparent 50%)"
        }} />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}>
                <ScrollText size={26} className="text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wide" style={{ color: "hsl(var(--foreground))", fontFamily: "Rajdhani, sans-serif" }}>
                  Logs de Missões
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {stats.total} missões concluídas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
              <Filter size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                className="bg-transparent border-none outline-none text-sm w-40"
                style={{ color: "hsl(var(--foreground))" }}
                placeholder="Filtrar nome ou missão..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: <Target size={16} />, color: "hsl(var(--gold))" },
          { label: "XP Total", value: stats.totalXP, icon: <Star size={16} />, color: "hsl(var(--gold))" },
          { label: "Difícil", value: stats.hard, icon: <Target size={16} />, color: "hsl(var(--destructive))" },
          { label: "Média", value: stats.medium, icon: <Target size={16} />, color: "hsl(43 90% 52%)" },
        ].map((s, i) => (
          <div key={i} className="psp-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
              {s.icon}
              <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif" }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="gold-line" />

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="psp-card p-16 text-center">
          <Target size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            {filterUser ? "Nenhum registo encontrado." : "Ainda não existem missões concluídas."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const dc = DIFF_CONFIG[log.dificuldade] || { color: "hsl(var(--border))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))" };
            const isExpanded = expandedLog === log.id;
            const hasAttachments = log.anexos && log.anexos.length > 0;
            
            return (
              <div key={log.id} className="psp-card overflow-hidden transition-all"
                style={{ borderLeft: `3px solid ${dc.color}` }}>
                <div 
                  className="p-4 flex items-center gap-4 table-row-hover cursor-pointer"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                  {/* Date */}
                  <div className="text-center shrink-0 w-16">
                    <div className="text-xs font-bold" style={{ color: "hsl(var(--foreground))", fontFamily: "Rajdhani, sans-serif" }}>
                      {log.data}
                    </div>
                    <div className="text-[10px] flex items-center justify-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <Clock size={10} /> {log.hora}
                    </div>
                  </div>

                  {/* User */}
                  <div className="shrink-0 w-28">
                    <div className="text-sm font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                      {log.usuario}
                    </div>
                    <span className="rank-badge text-[9px]">{log.cargo}</span>
                  </div>

                  {/* Mission */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                      <Target size={13} style={{ color: dc.color }} />
                      {log.missao}
                      {hasAttachments && <Paperclip size={12} style={{ color: "hsl(var(--muted-foreground))" }} />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                        {log.dificuldade}
                      </span>
                      {log.xp && (
                        <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "hsl(var(--gold))" }}>
                          <Star size={9} fill="currentColor" /> +{log.xp} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Companions + expand */}
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] uppercase tracking-wider flex items-center gap-1 justify-end"
                        style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif" }}>
                        <Users size={10} /> Acompanhados
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                        {log.acompanhados}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} style={{ color: "hsl(var(--muted-foreground))" }} /> : <ChevronDown size={16} style={{ color: "hsl(var(--muted-foreground))" }} />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    {log.descricao && (
                      <p className="text-xs pt-3 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{log.descricao}</p>
                    )}
                    <div className="sm:hidden text-xs" style={{ color: "hsl(var(--foreground))" }}>
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>Acompanhados: </span>{log.acompanhados}
                    </div>
                    {hasAttachments && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
                          <Paperclip size={11} /> Anexos ({log.anexos!.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {log.anexos!.map((att, i) => (
                            att.type.startsWith("image/") ? (
                              <img key={i} src={att.data} alt={att.name}
                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ border: "1px solid hsl(var(--border))" }}
                                onClick={() => setPreviewImage(att.data)} />
                            ) : (
                              <a key={i} href={att.data} download={att.name}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
                                <FileText size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                                {att.name}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
