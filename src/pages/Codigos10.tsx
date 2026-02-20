import { useState } from "react";
import { Radio, MessageSquare, Car, Siren, MapPin, AlertOctagon, Signal } from "lucide-react";

interface CodigoCategoria {
  titulo: string;
  icon: React.ElementType;
  color: string;
  codigos: { codigo: string; desc: string }[];
}

const CATEGORIAS: CodigoCategoria[] = [
  {
    titulo: "Comunicações",
    icon: MessageSquare,
    color: "hsl(200 80% 60%)",
    codigos: [
      { codigo: "10-01", desc: "Teste de comunicações / rádio" },
      { codigo: "10-02", desc: "Negativo" },
      { codigo: "10-03", desc: "Alguma unidade disponível para patrulha" },
      { codigo: "10-04", desc: "OK / Recebido / Afirmativo" },
      { codigo: "10-05", desc: "Situação sob-controlo" },
      { codigo: "10-06", desc: "Ocupado" },
      { codigo: "10-09", desc: "Repita a última comunicação" },
      { codigo: "10-22", desc: "Ignore a última comunicação" },
      { codigo: "10-24", desc: "Mesma comunicação (face à anterior)" },
      { codigo: "10-25", desc: "Ocupado em processamento / relatório" },
      { codigo: "10-26", desc: "Tempo estimado de chegada" },
    ],
  },
  {
    titulo: "Operações",
    icon: Car,
    color: "hsl(var(--gold))",
    codigos: [
      { codigo: "10-10", desc: "Abordagem de trânsito" },
      { codigo: "10-11", desc: "Abordagem de alto risco" },
      { codigo: "10-12", desc: "Aguarde" },
      { codigo: "10-13", desc: "Tiros disparados" },
      { codigo: "10-17", desc: "Luta em progresso" },
      { codigo: "10-18", desc: "Indivíduo suspeito" },
      { codigo: "10-32", desc: "Solicita apoio / reforços" },
      { codigo: "10-35", desc: "Criar perímetro" },
      { codigo: "10-41", desc: "Iniciar patrulha" },
      { codigo: "10-42", desc: "Terminar patrulha" },
    ],
  },
  {
    titulo: "Ocorrências",
    icon: Siren,
    color: "hsl(0 70% 60%)",
    codigos: [
      { codigo: "10-44", desc: "Civil ferido" },
      { codigo: "10-50", desc: "Acidente de viação" },
      { codigo: "10-51", desc: "Apreensão de veículo" },
      { codigo: "10-52", desc: "Manobra PIT" },
      { codigo: "10-57", desc: "Tráfico / Venda de droga" },
      { codigo: "10-66", desc: "Transporte prisional" },
      { codigo: "10-70", desc: "Perseguição a pé" },
      { codigo: "10-76", desc: "Perseguição marítima" },
      { codigo: "10-80", desc: "Perseguição a veículo" },
      { codigo: "10-90", desc: "Assalto" },
      { codigo: "10-97", desc: "A caminho" },
    ],
  },
  {
    titulo: "Estado & Situação",
    icon: MapPin,
    color: "hsl(145 60% 50%)",
    codigos: [
      { codigo: "10-07", desc: "Saída de serviço" },
      { codigo: "10-08", desc: "Entrada de serviço" },
      { codigo: "10-14", desc: "Alteração de frequência" },
      { codigo: "10-15", desc: "Transporte de detido" },
      { codigo: "10-20", desc: "Localização" },
      { codigo: "10-23", desc: "Chegada ao local" },
      { codigo: "10-30", desc: "Pessoa / veículo procurado" },
      { codigo: "10-31", desc: "Presença de superior solicitada" },
      { codigo: "10-43", desc: "Ponto de situação" },
    ],
  },
  {
    titulo: "Códigos Especiais",
    icon: AlertOctagon,
    color: "hsl(25 90% 60%)",
    codigos: [
      { codigo: "10-13 Alpha", desc: "Tiros contra guardas" },
      { codigo: "Código 99", desc: "Apoio urgente (Botão pânico)" },
      { codigo: "Código 100", desc: "Rádio limpo / Prioridade" },
      { codigo: "VPV", desc: "Veículo perdido de vista" },
    ],
  },
  {
    titulo: "Níveis de Apoio",
    icon: Signal,
    color: "hsl(270 60% 65%)",
    codigos: [
      { codigo: "Código 1", desc: "Apoio sem luzes nem sirenes" },
      { codigo: "Código 2", desc: "Apoio só com luzes" },
      { codigo: "Código 3", desc: "Apoio com luzes e sirenes" },
      { codigo: "Código 4", desc: "Situação terminada" },
      { codigo: "Código 7", desc: "Pausa de serviço" },
      { codigo: "Código 8", desc: "Retorno da pausa" },
    ],
  },
];

export default function Codigos10() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const activeCat = CATEGORIAS[activeTab];
  const filteredCodigos = search
    ? CATEGORIAS.flatMap(c => c.codigos.filter(
        cod => cod.codigo.toLowerCase().includes(search.toLowerCase()) ||
               cod.desc.toLowerCase().includes(search.toLowerCase())
      ).map(cod => ({ ...cod, cat: c.titulo, color: c.color })))
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "hsl(var(--gold))" }}>
            <Radio size={22} /> Códigos 10
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Sistema de comunicações rádio da PSP
          </p>
        </div>
        <input
          className="psp-input w-64"
          placeholder="Pesquisar código ou descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Search results mode */}
      {filteredCodigos ? (
        <div className="psp-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
              Resultados — {filteredCodigos.length} encontrado{filteredCodigos.length !== 1 ? "s" : ""}
            </h2>
          </div>
          {filteredCodigos.length === 0 ? (
            <div className="text-center py-12" style={{ color: "hsl(var(--muted-foreground))" }}>
              Nenhum código encontrado
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCodigos.map((cod, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 table-row-hover">
                  <span className="font-mono font-bold text-sm min-w-[100px]"
                    style={{ color: cod.color, fontFamily: "Rajdhani, sans-serif" }}>
                    {cod.codigo}
                  </span>
                  <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{cod.desc}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-widest"
                    style={{ color: "hsl(var(--muted-foreground))" }}>{cod.cat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat, idx) => {
              const Icon = cat.icon;
              const isActive = idx === activeTab;
              return (
                <button
                  key={cat.titulo}
                  onClick={() => setActiveTab(idx)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    background: isActive ? cat.color + "18" : "hsl(var(--card))",
                    border: `1px solid ${isActive ? cat.color + "50" : "hsl(var(--border))"}`,
                    color: isActive ? cat.color : "hsl(var(--muted-foreground))",
                    boxShadow: isActive ? `0 0 15px ${cat.color}15` : "none",
                  }}
                >
                  <Icon size={14} />
                  {cat.titulo}
                </button>
              );
            })}
          </div>

          {/* Active Category Content */}
          <div className="psp-card overflow-hidden fade-in" key={activeTab}
            style={{ borderColor: activeCat.color + "30" }}>
            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${activeCat.color}25`, background: activeCat.color + "06" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: activeCat.color + "15", border: `1px solid ${activeCat.color}30` }}>
                <activeCat.icon size={16} style={{ color: activeCat.color }} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest"
                  style={{ fontFamily: "Rajdhani, sans-serif", color: activeCat.color }}>
                  {activeCat.titulo}
                </h2>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {activeCat.codigos.length} códigos
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {activeCat.codigos.map((cod, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 table-row-hover group">
                  <div className="flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded"
                    style={{
                      background: activeCat.color + "10",
                      border: `1px solid ${activeCat.color}25`,
                    }}>
                    <span className="font-mono font-bold text-xs tracking-wide"
                      style={{ color: activeCat.color, fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
                      {cod.codigo}
                    </span>
                  </div>
                  <span className="text-sm group-hover:translate-x-0.5 transition-transform"
                    style={{ color: "hsl(var(--foreground))" }}>
                    {cod.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
