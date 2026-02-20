import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import emblem from "@/assets/psp-emblem.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/hub");
    } catch {
      setError("Utilizador ou Password incorreta!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(220 40% 5%) 0%, hsl(220 35% 10%) 100%)" }}>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent)", filter: "blur(60px)" }} />

      <div className="relative z-10 w-full max-w-sm mx-4 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "hsl(var(--gold) / 0.4)", boxShadow: "0 0 30px hsl(var(--gold) / 0.2)" }}>
              <img src={emblem} alt="PSP" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase"
            style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif" }}>
            PSP Sucesso
          </h1>
          <p className="text-xs tracking-[0.25em] uppercase mt-1"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            Sistema de Gestão Interna
          </p>
          <div className="gold-line w-24 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="psp-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} style={{ color: "hsl(var(--gold))" }} />
            <span className="nav-item" style={{ color: "hsl(var(--foreground))" }}>Autenticação</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                Utilizador
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "hsl(var(--muted-foreground))" }} />
                <input
                  className="psp-input pl-9"
                  type="text"
                  placeholder="Nome de utilizador"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: "hsl(var(--muted-foreground))", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "hsl(var(--muted-foreground))" }} />
                <input
                  className="psp-input pl-9"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded"
                style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)" }}>
                <AlertCircle size={14} style={{ color: "hsl(var(--destructive))" }} />
                <span className="text-xs" style={{ color: "hsl(var(--destructive))" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? "A autenticar..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "hsl(var(--muted-foreground))" }}>
          Acesso restrito a pessoal autorizado
        </p>
      </div>
    </div>
  );
}
