import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isSuperior } from "@/lib/roles";
import { Shield, Users, AlertTriangle, ScrollText, LogOut, Star, Radio, Home, Target, ClipboardList } from "lucide-react";
import emblem from "@/assets/psp-logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item flex items-center gap-2 px-3 py-2 rounded transition-all ${
      isActive
        ? "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)] border-b-2 border-[hsl(var(--gold))]"
        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--gold))]"
    }`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Top bar */}
      <header className="psp-header">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
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
                Sistema Interno
              </div>
            </div>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold" style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {currentUser.username}
                </div>
                <div className="rank-badge">{currentUser.role}</div>
              </div>
              <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 text-xs">
                <LogOut size={13} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 px-6 pb-0 border-t overflow-x-auto"
          style={{ borderColor: "hsl(var(--border))" }}>
          <NavLink to="/" end className={({ isActive }) =>
            `nav-item flex items-center gap-2 px-3 py-2 rounded transition-all text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--gold))]`
          }>
            <Home size={14} />
            Início
          </NavLink>
          <NavLink to="/hub" end className={navLinkClass}>
            <Users size={14} />
            Hub
          </NavLink>
          <NavLink to="/blacklist" className={navLinkClass}>
            <AlertTriangle size={14} />
            Blacklist
          </NavLink>
          <NavLink to="/codigos10" className={navLinkClass}>
            <Radio size={14} />
            Códigos 10
          </NavLink>
          {currentUser && isSuperior(currentUser.role) && (
            <>
              <NavLink to="/logs" className={navLinkClass}>
                <ScrollText size={14} />
                Logs
              </NavLink>
              <NavLink to="/superiores" className={navLinkClass}>
                <Star size={14} />
                Superiores
              </NavLink>
            </>
          )}
          <NavLink to="/junta-te" className={({ isActive }) =>
            `nav-item flex items-center gap-2 px-3 py-2 rounded transition-all ${
              isActive
                ? "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--gold))]"
            }`
          }>
            <Shield size={14} />
            Junta-te
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 p-6 fade-in">
        {children}
      </main>
    </div>
  );
}

