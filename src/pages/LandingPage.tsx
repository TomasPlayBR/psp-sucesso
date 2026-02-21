import { useState, useEffect } from "react";
import { Shield, Users, AlertTriangle, Radio, ChevronRight, ExternalLink, Megaphone, Calendar, Plus, ImagePlus, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isSuperior } from "@/lib/roles";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import emblem from "@/assets/psp-logo.png";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Post {
  id: string;
  title: string;
  content: string;
  tag: string;
  tagColor: string;
  date: string;
  imageUrl?: string;
  author?: string;
}

const TAG_OPTIONS = [
  { label: "Recrutamento", color: "hsl(145 60% 50%)" },
  { label: "Sistema", color: "hsl(200 80% 60%)" },
  { label: "Diretiva", color: "hsl(var(--gold))" },
  { label: "Operação", color: "hsl(280 60% 60%)" },
  { label: "Informação", color: "hsl(30 80% 55%)" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Gestão de Efetivos",
    desc: "Controlo completo dos agentes, patentes e operações internas.",
    color: "hsl(var(--gold))",
  },
  {
    icon: AlertTriangle,
    title: "Blacklist Ativa",
    desc: "Registo público de infratores com níveis de perigo em tempo real.",
    color: "hsl(0 70% 60%)",
  },
  {
    icon: Radio,
    title: "Códigos 10",
    desc: "Sistema de comunicações rádio completo para operações em patrulha.",
    color: "hsl(200 80% 60%)",
  },
  {
    icon: Shield,
    title: "Recrutamento",
    desc: "Processo de seleção estruturado com entrevistas e avaliações.",
    color: "hsl(145 60% 50%)",
  },
];

const STATS = [
  { label: "Hierarquia Completa", value: "15 Patentes" },
  { label: "Sistema de Logs", value: "Registros de logs" },
];

function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LandingPage() {
  const { currentUser } = useAuth();
  const canPost = currentUser && isSuperior(currentUser.role);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Informação");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "publicacoes"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const fetched: Post[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            content: data.content,
            tag: data.tag,
            tagColor: data.tagColor,
            date: data.date || "—",
            imageUrl: data.imageUrl || undefined,
            author: data.author || undefined,
          };
        });
        setPosts(fetched);
      } catch (e) {
        console.error("Erro ao carregar publicações:", e);
        // Fallback to empty
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem demasiado grande (máx. 2MB)");
      return;
    }
    setImageFile(file);
    const preview = await imageToBase64(file);
    setImagePreview(preview);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    const tagOption = TAG_OPTIONS.find((t) => t.label === tag);
    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = await imageToBase64(imageFile);
    }

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
      await addDoc(collection(db, "publicacoes"), {
        title: title.trim(),
        content: content.trim(),
        tag,
        tagColor: tagOption?.color || "hsl(var(--gold))",
        date: dateStr,
        imageUrl: imageUrl || null,
        author: currentUser?.username || "Direção",
        timestamp: serverTimestamp(),
      });

      // Refresh posts
      const q = query(collection(db, "publicacoes"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));

      // Reset form
      setTitle("");
      setContent("");
      setTag("Informação");
      setImageFile(null);
      setImagePreview(null);
      setDialogOpen(false);
    } catch (e) {
      console.error("Erro ao criar publicação:", e);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Header */}
      <header className="psp-header relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={emblem} alt="PSP" className="w-10 h-10 object-cover rounded-full landing-emblem"
              style={{ border: "2px solid hsl(var(--gold)/0.5)" }} />
            <div>
              <div className="text-lg font-bold tracking-widest uppercase"
                style={{ color: "hsl(var(--gold))", fontFamily: "Rajdhani, sans-serif", lineHeight: 1 }}>
                PSP Sucesso
              </div>
              <div className="text-[10px] tracking-[0.25em] uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                Polícia de Segurança Pública
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/blacklist-pub" className="btn-ghost text-xs hidden sm:inline-flex">Blacklist</Link>
            <Link to="/junta-te" className="btn-ghost text-xs hidden sm:inline-flex">Junta-te</Link>
            {currentUser ? (
              <Link to="/hub" className="btn-gold text-xs">Entrar no Sistema</Link>
            ) : (
              <Link to="/login" className="btn-gold text-xs">Login PSP</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-20 px-6">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)" }} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden landing-emblem-glow"
              style={{
                border: "3px solid hsl(var(--gold) / 0.4)",
                boxShadow: "0 0 60px hsl(var(--gold) / 0.15), inset 0 0 30px hsl(var(--gold) / 0.05)"
              }}>
              <img src={emblem} alt="PSP Sucesso" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="inline-block mb-4 px-4 py-1 rounded-full text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{
              background: "hsl(var(--gold) / 0.08)",
              border: "1px solid hsl(var(--gold) / 0.2)",
              color: "hsl(var(--gold))",
              fontFamily: "Rajdhani, sans-serif"
            }}>
            Sucesso Roleplay
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
            Polícia de{" "}
            <span style={{ color: "hsl(var(--gold))" }}>Segurança</span>{" "}
            Pública
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            Garantimos a ordem, segurança e justiça na cidade, atuando de forma profissional e organizada dentro do roleplay.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/junta-te" className="btn-gold inline-flex items-center justify-center gap-2 text-sm px-8 py-3">
              <Shield size={16} />
              Quero ser PSP
            </Link>
            <Link to="/blacklist-pub" className="btn-ghost inline-flex items-center justify-center gap-2 text-sm px-8 py-3">
              <AlertTriangle size={16} />
              Ver Blacklist
            </Link>
          </div>

          <div className="flex flex-row justify-center items-center gap-12 sm:gap-24 max-w-lg mx-auto border-t border-white/5 pt-10 mt-12">
            {STATS.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    color: "hsl(var(--gold))",
                    textShadow: "0 0 20px hsl(var(--gold) / 0.3)"
                  }}>
                  {value}
                </div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
              O Nosso Sistema
            </h2>
            <div className="gold-line w-16 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="psp-card p-5 group hover:scale-[1.02] transition-transform duration-200"
                style={{ borderColor: color + "30" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: color + "12", border: `1px solid ${color}30` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1"
                  style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publicações */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Megaphone size={20} style={{ color: "hsl(var(--gold))" }} />
              <h2 className="text-2xl font-bold uppercase tracking-widest"
                style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                Publicações
              </h2>
            </div>
            <div className="gold-line w-16 mx-auto" />
            <p className="text-xs mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Novidades e comunicados da Direção
            </p>

            {/* Create Post Button — Superiors only */}
            {canPost && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="mt-4 btn-gold inline-flex items-center gap-2 text-xs px-6 py-2.5">
                    <Plus size={14} />
                    Nova Publicação
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold uppercase tracking-widest"
                      style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
                      Criar Publicação
                    </DialogTitle>
                    <DialogDescription className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Publica um comunicado visível a todos na página principal.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    {/* Tag select */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Categoria</label>
                      <Select value={tag} onValueChange={setTag}>
                        <SelectTrigger className="w-full" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TAG_OPTIONS.map((t) => (
                            <SelectItem key={t.label} value={t.label}>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }} />
                                {t.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Título</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título da publicação"
                        maxLength={120}
                        style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Conteúdo</label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreve o conteúdo da publicação..."
                        maxLength={1000}
                        rows={4}
                        style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                      />
                    </div>

                    {/* Image upload */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block"
                        style={{ color: "hsl(var(--muted-foreground))" }}>Imagem (opcional)</label>
                      {imagePreview ? (
                        <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: "hsl(var(--border))" }}>
                          <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                          <button onClick={removeImage}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "hsl(0 70% 50% / 0.85)", color: "#fff" }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg cursor-pointer border-2 border-dashed transition-colors hover:border-solid"
                          style={{ borderColor: "hsl(var(--gold) / 0.3)", background: "hsl(var(--gold) / 0.03)" }}>
                          <ImagePlus size={24} style={{ color: "hsl(var(--gold) / 0.5)" }} />
                          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                            Clica para adicionar imagem (máx. 2MB)
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !title.trim() || !content.trim()}
                      className="w-full font-bold uppercase tracking-widest text-xs py-3"
                      style={{
                        background: "hsl(var(--gold))",
                        color: "hsl(var(--background))",
                        fontFamily: "Rajdhani, sans-serif",
                      }}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> A publicar...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Megaphone size={14} /> Publicar</span>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Posts grid */}
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--gold))" }} />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-xs py-8" style={{ color: "hsl(var(--muted-foreground))" }}>
              Sem publicações de momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <article key={post.id} className="psp-card overflow-hidden flex flex-col hover:scale-[1.01] transition-transform duration-200"
                  style={{ borderColor: post.tagColor + "25" }}>
                  {post.imageUrl && (
                    <div className="w-full h-44 overflow-hidden">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ background: post.tagColor + "15", color: post.tagColor, border: `1px solid ${post.tagColor}30` }}>
                        {post.tag}
                      </span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Calendar size={10} />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug"
                      style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--foreground))" }}>
                      {post.title}
                    </h3>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {post.content}
                    </p>
                    {post.author && (
                      <div className="text-[10px] uppercase tracking-widest pt-2 border-t"
                        style={{ color: "hsl(var(--gold) / 0.6)", borderColor: "hsl(var(--border))" }}>
                        — {post.author}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-16" style={{ background: "hsl(var(--card))" }}>
        <div className="max-w-3xl mx-auto psp-card p-8 text-center"
          style={{ borderColor: "hsl(var(--gold) / 0.2)", boxShadow: "0 0 40px hsl(var(--gold) / 0.05)" }}>
          <h2 className="text-xl font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "Rajdhani, sans-serif", color: "hsl(var(--gold))" }}>
            Acerca de Nós
          </h2>
          <div className="gold-line w-12 mx-auto mb-4" />
          <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            A PSP do Sucesso RP é uma corporação focada na garantia da ordem, segurança e justiça na cidade,
            atuando de forma profissional e organizada dentro do roleplay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://discord.gg/MbQgf6MM4Q" target="_blank" rel="noopener noreferrer"
              className="btn-gold inline-flex items-center justify-center gap-2 text-xs px-6 py-2.5">
              <ExternalLink size={13} />
              Discord da PSP
            </a>
            <Link to="/junta-te" className="btn-ghost inline-flex items-center justify-center gap-2 text-xs px-6 py-2.5">
              <ChevronRight size={13} />
              Saber Mais
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
          © 2026 PSP — Sucesso Roleplay — TomasPlayBR
        </p>
      </footer>
    </div>
  );
}
