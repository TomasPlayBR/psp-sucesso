import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lock, Unlock, ScrollText, Clock, User, Briefcase, Search, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

function isDetidoLog(acao: string) {
  const lower = acao.toLowerCase();
  return lower.includes("detido") || lower.includes("libertou") || lower.includes("registou detido");
}

function getLogType(acao: string): "entrada" | "saida" {
  const lower = acao.toLowerCase();
  if (lower.includes("libertou")) return "saida";
  return "entrada";
}

export default function DetidosLogs() {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");

  const exportCSV = () => {
    const header = "Data,Hora,Agente,Cargo,Ação";
    const rows = filtered.map((l) => `"${l.data}","${l.hora}","${l.usuario}","${l.cargo}","${l.acao}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_detidos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Logs de Detidos - PSP", 14, 20);
    doc.setFontSize(9);
    doc.text(`Exportado em: ${new Date().toLocaleString("pt-PT")}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [["Data", "Hora", "Agente", "Cargo", "Ação"]],
      body: filtered.map((l) => [l.data, l.hora, l.usuario, l.cargo, l.acao]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });
    doc.save(`logs_detidos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const entries = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as LogEntry))
        .filter((l) => isDetidoLog(l.acao));
      setAllLogs(entries);
    });
    return unsub;
  }, []);

  const filtered = search.trim()
    ? allLogs.filter(
        (l) =>
          l.usuario.toLowerCase().includes(search.toLowerCase()) ||
          l.acao.toLowerCase().includes(search.toLowerCase())
      )
    : allLogs;

  const totalEntradas = allLogs.filter((l) => getLogType(l.acao) === "entrada").length;
  const totalSaidas = allLogs.filter((l) => getLogType(l.acao) === "saida").length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}
          >
            <ScrollText size={22} /> Logs de Detidos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Histórico de registos e libertações de detidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por agente ou ação..."
              className="pl-9 text-xs h-9"
              style={{
                background: "hsl(var(--secondary))",
                borderColor: "hsl(var(--border))",
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs shrink-0">
                <Download size={13} /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCSV} className="gap-2 text-xs cursor-pointer">
                <FileText size={13} /> Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF} className="gap-2 text-xs cursor-pointer">
                <FileText size={13} /> Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="psp-card p-4 text-center"
          style={{ borderColor: "hsl(var(--gold) / 0.2)" }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}
          >
            {allLogs.length}
          </div>
          <div
            className="text-[10px] uppercase tracking-widest mt-1"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Total Registos
          </div>
        </div>
        <div
          className="psp-card p-4 text-center"
          style={{ borderColor: "hsl(var(--destructive) / 0.2)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Lock size={14} style={{ color: "hsl(var(--destructive))" }} />
            <span
              className="text-2xl font-bold"
              style={{ color: "hsl(var(--destructive))", fontFamily: "Rajdhani, sans-serif" }}
            >
              {totalEntradas}
            </span>
          </div>
          <div
            className="text-[10px] uppercase tracking-widest mt-1"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Entradas
          </div>
        </div>
        <div
          className="psp-card p-4 text-center"
          style={{ borderColor: "hsl(var(--success) / 0.2)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Unlock size={14} style={{ color: "hsl(var(--success))" }} />
            <span
              className="text-2xl font-bold"
              style={{ color: "hsl(var(--success))", fontFamily: "Rajdhani, sans-serif" }}
            >
              {totalSaidas}
            </span>
          </div>
          <div
            className="text-[10px] uppercase tracking-widest mt-1"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Libertações
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="psp-card overflow-hidden">
        <div
          className="grid grid-cols-[100px_1fr_1fr_2fr] px-4 py-3 text-xs uppercase tracking-widest"
          style={{
            background: "hsl(var(--secondary))",
            borderBottom: "1px solid hsl(var(--border))",
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 700,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Clock size={11} /> Data/Hora
          </div>
          <div className="flex items-center gap-1.5">
            <User size={11} /> Agente
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={11} /> Cargo
          </div>
          <div className="flex items-center gap-1.5">Ação</div>
        </div>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div
              className="text-center py-12 text-sm"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Nenhum registo de detidos encontrado
            </div>
          ) : (
            filtered.map((log) => {
              const type = getLogType(log.acao);
              const icon =
                type === "entrada" ? (
                  <Lock size={13} style={{ color: "hsl(var(--destructive))" }} />
                ) : (
                  <Unlock size={13} style={{ color: "hsl(var(--success))" }} />
                );

              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[100px_1fr_1fr_2fr] px-4 py-3 text-xs items-center table-row-hover"
                >
                  <div
                    className="font-mono text-[11px]"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    <div>{log.data}</div>
                    <div>{log.hora}</div>
                  </div>
                  <div
                    className="font-semibold"
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {log.usuario}
                  </div>
                  <div>
                    <span
                      className="rank-badge"
                      style={{
                        color: cargoColor(log.cargo),
                        borderColor: cargoColor(log.cargo) + "50",
                        background: cargoColor(log.cargo) + "15",
                      }}
                    >
                      {log.cargo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span style={{ color: "hsl(var(--foreground) / 0.8)" }}>{log.acao}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
