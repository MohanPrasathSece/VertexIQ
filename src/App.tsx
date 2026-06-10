import founderImg from "@/assets/founder.jpg";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Users,
  Gauge,
  UserCheck,
  TrendingUp,
  Compass,
  Crown,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  Star,
  Bitcoin,
  Activity,
  LineChart,
  Coins,
  CircleDollarSign,
  Terminal,
  Send,
  Shield,
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  type Variants,
} from "motion/react";
import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';

/* ---------------- MOTION HELPERS ---------------- */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
}) {
  const tags = {
    div: motion.div,
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    p: motion.p,
    span: motion.span,
  } as const;
  const MotionTag = tags[as];
  return (
    <MotionTag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.05 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Home({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <FadeSection>
        <Hero onSignUp={onSignUp} onLogin={onLogin} />
      </FadeSection>
      <FadeSection>
        <LogoCarousel />
      </FadeSection>
      <FadeSection>
        <Problem />
      </FadeSection>
      <FadeSection>
        <Method />
      </FadeSection>
      <FadeSection>
        <About />
      </FadeSection>
      <FadeSection>
        <Testimonials />
      </FadeSection>
      <FadeSection>
        <CtaStrip onSignUp={onSignUp} />
      </FadeSection>
    </>
  );
}

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-clip">
      <Nav onSignUp={() => setAuthMode('signup')} onLogin={() => setAuthMode('login')} />
      <Routes>
        <Route path="/" element={<Home onSignUp={() => setAuthMode('signup')} onLogin={() => setAuthMode('login')} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
      <AnimatePresence>
        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={setAuthMode} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { name: "Accueil", href: "/#home" },
    { name: "Insights", href: "/#insights" },
    { name: "Technologie", href: "/#technology" },
    { name: "À propos", href: "/#about" },
    { name: "Succès", href: "/#success-stories" },
    { name: "Contact", href: "/contact" }
  ];
  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50">
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="backdrop-blur-xl bg-white/75 border border-white/70 rounded-full shadow-[0_4px_24px_rgba(167,139,250,0.10),0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
        >
          <div className="px-6 h-[64px] flex items-center justify-between">
            <a href="#" className="font-display font-bold tracking-tight text-[18px]">
              VERTEXIQ<span className="text-[#A78BFA]">.</span>
            </a>
            <nav className="hidden lg:flex items-center gap-9 text-[14px] text-muted2">
              {links.map((l) => (
                <Link
                  key={l.name}
                  to={l.href}
                  className="relative group hover:text-ink transition-colors"
                >
                  {l.name}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={onLogin} className="hidden sm:block text-[14px] font-medium text-ink hover:text-[#A78BFA] transition-colors px-2">
                Connexion
              </button>
              <Magnetic className="hidden sm:block">
                <motion.button
                  onClick={onSignUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-[13px] font-medium overflow-hidden"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="relative z-10">S'inscrire</span>
                  <ArrowRight className="relative z-10 size-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.button>
              </Magnetic>
              <button
                className="lg:hidden p-2 rounded-full border border-hair bg-white shadow-soft"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-ink text-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/10">
              <a href="#" className="font-display font-bold tracking-tight text-[18px]">
                VERTEXIQ<span className="text-[#A78BFA]">.</span>
              </a>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-5">
              {links.map((l, i) => (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-bold text-[24px] hover:text-[#A78BFA] transition-colors"
                >
                  <Link to={l.href} className="block w-full">{l.name === "Succès" ? "Succès" : l.name}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-8 pb-10">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => { setMenuOpen(false); onLogin(); }}
                  className="w-full text-center py-4 text-[16px] font-semibold text-white border border-white/20 rounded-full"
                >
                  Connexion
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onSignUp(); }}
                  className="group relative inline-flex items-center gap-2 rounded-full bg-white text-ink px-7 py-4 text-[14px] font-semibold overflow-hidden w-full justify-center"
                >
                  <span className="relative z-10">S'inscrire</span>
                  <ArrowRight className="relative z-10 size-4" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ onSignUp, onLogin }: { onSignUp: () => void; onLogin?: () => void }) {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* static gradient blobs — no JS scroll tracking, paint once */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-grad-lavender blur-2xl opacity-50" />
      <div className="pointer-events-none absolute top-40 -left-32 w-[480px] h-[480px] rounded-full bg-grad-pink blur-2xl opacity-40" />
      <div className="pointer-events-none absolute inset-0 dotted-bg opacity-30" />

      {/* Floating Crypto Icons in Background */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-[10%] text-[#F7931A]/20 pointer-events-none">
        <Bitcoin className="w-16 h-16" />
      </motion.div>
      <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-40 right-[15%] text-[#F3BA2F]/20 pointer-events-none">
        <Coins className="w-24 h-24" />
      </motion.div>
      <motion.div animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 right-[5%] text-[#627EEA]/20 pointer-events-none">
        <LineChart className="w-20 h-20" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-28 lg:pt-32 pb-24 lg:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* LEFT */}
        <Stagger className="lg:col-span-6">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted2"
          >
            <span className="size-1.5 rounded-full bg-[#A78BFA]" />
            Trading Intelligent & Solutions de Marché Propulsées par l'IA
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display font-bold leading-[1.05] tracking-tight"
          >
            <span className="block text-[34px] sm:text-[48px] lg:text-[60px] text-ink">
              Tradez mieux.
            </span>
            <span className="block text-[34px] sm:text-[48px] lg:text-[60px] relative text-ink">
              Agissez{" "}
              <span className="relative">
                <span className="relative z-10">vite.</span>
                <span
                  className="absolute left-0 bottom-0.5 w-full h-[5px] rounded-full opacity-60"
                  style={{ background: "linear-gradient(90deg, #A78BFA, #EC4899)" }}
                />
              </span>
            </span>
            <span className="block text-[34px] sm:text-[48px] lg:text-[60px] text-ink/40">
              Croissez sereinement.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-7 text-[15px] leading-relaxed text-muted2 max-w-md"
          >
            VertexIQ combine l'intelligence artificielle avancée, l'analyse en temps réel et l'intelligence de marché automatisée pour aider les traders à identifier les opportunités, réduire la complexité et prendre des décisions basées sur les données en toute confiance.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Magnetic>
              <motion.button
                onClick={onSignUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 rounded-full px-7 py-4 text-[14px] font-semibold text-white overflow-hidden"
                style={{ backgroundColor: "#111111" }}
              >
                <span className="relative z-10">Commencer</span>
                <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>
            </Magnetic>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[12px] text-muted2">
            Approuvé par des traders, investisseurs et professionnels axés sur la technologie à travers le monde.
          </motion.p>
        </Stagger>

        {/* RIGHT — dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="lg:col-span-6 relative h-[420px] sm:h-[560px] lg:h-[640px]"
          style={{ willChange: "transform" }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- LOGO CAROUSEL ---------------- */
function LogoCarousel() {
  const logos = [
    { name: "United Kingdom", svg: "M4 20V4h2.4l5.6 12L17.6 4H20v16h-2V8.2L12.6 18h-1.2L6 8.2V20H4z" },
    { name: "Canada", svg: "M12 4a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" },
    { name: "Germany", svg: "M2 18L12 4l10 14H2zm4.5-2h11L12 7.5 6.5 16z" },
    { name: "Australia", svg: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" },
    { name: "Singapore", svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z" },
    { name: "France", svg: "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" },
    { name: "Netherlands", svg: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5z" },
    { name: "UAE", svg: "M4 8h16v8H4V8zm2 2v4h12v-4H6z" },
  ];

  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-12 border-y border-hair overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-6">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted2 text-center">
          Approuvé par des utilisateurs à travers
        </p>
      </div>
      <div className="relative w-full overflow-hidden mask-gradient">
        <motion.div
          className="flex gap-16 items-center w-max"
          animate={{ x: [0, -1600] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        >
          {marqueeLogos.map((logo, i) => (
            <div
              key={i}
              className="flex items-center gap-2 shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <path d={logo.svg} />
              </svg>
              <span className="font-display font-semibold text-[14px] tracking-tight whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* glow */}
      <div className="absolute inset-8 rounded-[40px] bg-grad-lavender blur-2xl opacity-80" />

      {/* main card */}
      <div className="w-[90%] max-w-[460px] rounded-[28px] bg-white border border-hair shadow-float p-5 sm:p-7 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted2">
              Aperçu Plateforme
            </div>
            <div className="mt-1 font-display font-bold text-[22px]">
              Performance
            </div>          </div>
          <div className="size-10 rounded-full bg-grad-lavender flex items-center justify-center">
            <Sparkles className="size-4 text-[#6F4FD0]" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#FAFAFA] border border-hair p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[12px] text-muted2">Précision IA</div>
              <div className="font-display font-bold text-[24px] sm:text-[28px] leading-none mt-1">
                94.8%
              </div>
            </div>
            <div className="text-[12px] font-medium text-[#0E7C4A] flex items-center gap-1">
              <TrendingUp className="size-3.5" /> +18.2%
            </div>
          </div>
          <Sparkline />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricMini label="Performance des Signaux" value="89/100" trend="+9" />
          <MetricMini label="Efficacité Automation" value="96%" trend="+14" />
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl border border-hair p-3">
      <div className="text-[11px] text-muted2">{label}</div>
      <div className="font-display font-bold text-[16px] mt-1">{value}</div>
      <div className="text-[11px] text-[#0E7C4A]">{trend}</div>
    </div>
  );
}

function Sparkline() {
  const pts = [10, 22, 16, 30, 26, 40, 34, 50, 46, 60, 58, 72];
  const w = 360;
  const h = 60;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full h-[60px]">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#sg)" />
      <path d={path} fill="none" stroke="#111111" strokeWidth="1.6" />
    </svg>
  );
}

/* ---------------- PROBLEM ---------------- */
function Problem() {
  const items = [
    {
      icon: Users,
      title: "Surcharge d'information",
      body: "Des milliers de signaux de marché rendent difficile l'identification d'opportunités significatives.",
    },
    {
      icon: Gauge,
      title: "Décisions émotionnelles",
      body: "La peur et l'incertitude conduisent souvent à des opportunités manquées ou à un mauvais timing.",
    },
    {
      icon: UserCheck,
      title: "Analyse lente",
      body: "Les méthodes de recherche traditionnelles ne peuvent pas toujours suivre le rythme des marchés en rapide évolution.",
    },
    {
      icon: TrendingUp,
      title: "Faible précision IA",
      body: "Sans approche structurée, la performance devient souvent imprévisible.",
    },
  ];
  return (
    <section id="insights" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionLabel>Défis courants</SectionLabel>
        </Reveal>
        <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <Reveal as="h2" className="font-display font-bold text-[40px] sm:text-[52px] leading-[1.05] max-w-2xl">
            Pourquoi le trading semble compliqué
          </Reveal>
          <Reveal as="p" delay={0.1} className="text-muted2 max-w-md text-[16px]">
            Les défis que rencontrent de nombreux investisseurs lorsqu'ils naviguent sur les marchés financiers modernes.
          </Reveal>
        </div>

        <Stagger className="mt-10 sm:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((it, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group rounded-3xl bg-white border border-hair p-6 sm:p-7 hover:shadow-soft hover:border-[#D8D8D8] transition-[box-shadow,border-color]"
            >
              <motion.div
                whileHover={{ rotate: -8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="size-11 rounded-2xl border border-hair flex items-center justify-center"
              >
                <it.icon className="size-5 text-ink" strokeWidth={1.6} />
              </motion.div>
              <div className="mt-7 font-display font-semibold text-[19px]">
                {it.title}
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted2">
                {it.body}
              </p>
              <div className="mt-8 flex items-center text-[13px] text-ink opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              </div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- METHOD ---------------- */
function Method() {
  const cards = [
    {
      title: "Intelligence de marché",
      body: "Transformez de grandes quantités de données de marché en insights clairs et exploitables.",
      icon: Compass,
      tint: "bg-grad-lavender",
      accent: "#A78BFA",
    },
    {
      title: "Analyse prédictive",
      body: "Identifiez les tendances et opportunités avant qu'elles ne deviennent évidentes pour le marché général.",
      icon: Crown,
      tint: "bg-grad-pink",
      accent: "#E58FB2",
    },
    {
      title: "Surveillance automatisée",
      body: "Suivez les marchés en continu et recevez des alertes intelligentes en temps réel.",
      icon: Briefcase,
      tint: "bg-grad-peach",
      accent: "#F0A878",
    },
    {
      title: "Optimisation des risques",
      body: "Équilibrez opportunité et protection grâce à une gestion des risques plus intelligente.",
      icon: Layers,
      tint: "bg-grad-mint",
      accent: "#7BB7A2",
    },
    {
      title: "Précision IA & Options",
      body: "Construisez une approche cohérente et basée sur les données conçue pour un succès à long terme.",
      icon: Sparkles,
      tint: "bg-grad-lavender",
      accent: "#8B6FE0",
    },
  ];

  return (
    <section id="technology" className="relative py-28 lg:py-36 overflow-clip">
      <div className="pointer-events-none absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-grad-lavender blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal>
            <SectionLabel center>Le Cadre VertexIQ</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.04]">
            <>
              Le Cadre VertexIQ
              <sup className="text-[20px] sm:text-[28px] align-super">™</sup>
            </>
          </Reveal>
          <Reveal as="p" delay={0.12} className="mt-5 text-muted2 text-[17px]">
            Un système moderne conçu pour simplifier la prise de décision et améliorer la conscience du marché.
          </Reveal>
        </div>

        {/* Stacked sticky cards — true overlap */}
        <div className="mt-16 lg:mt-24 relative">
          {cards.map((c, i) => (
            <StickyMethodCard
              key={c.title}
              card={c}
              index={i + 1}
              total={cards.length}
              big={i === 0 || i === cards.length - 1}
            />
          ))}
          {/* spacer so the last card has scroll room to "settle" */}
          <div className="h-[40vh]" />
        </div>
      </div>
    </section>
  );
}

function StickyMethodCard({
  card,
  index,
  total,
  big,
}: {
  card: { title: string; body: string; icon: any; tint: string; accent: string };
  index: number;
  total: number;
  big: boolean;
}) {
  const Icon = card.icon;
  const topOffset = 96 + (index - 1) * 28;

  return (
    <div
      className="sticky"
      style={{ top: `${topOffset}px`, marginBottom: index === total ? 0 : 28 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-3xl bg-white/90 border border-white shadow-float overflow-hidden"
        style={{ willChange: "transform" }}
      >
        <div className={`pointer-events-none absolute inset-0 ${card.tint} opacity-80`} />
        <div className="pointer-events-none absolute inset-0 dotted-bg opacity-20" />
        <div
          className={`pointer-events-none absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full ${card.tint} blur-2xl opacity-70`}
        />
        <div
          className="pointer-events-none absolute top-6 left-6 size-2 rounded-full"
          style={{ backgroundColor: card.accent }}
        />

        <div className="relative grid lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-10 lg:p-14 items-center min-h-[380px] sm:min-h-[420px] lg:min-h-[460px]">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between max-w-md">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="size-12 rounded-2xl bg-white border border-hair flex items-center justify-center shadow-soft"
              >
                <Icon className="size-5 text-ink" strokeWidth={1.6} />
              </motion.div>
              <div
                className="text-[11px] font-mono tracking-[0.18em] px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-white"
                style={{ color: card.accent }}
              >
                0{index} / 0{total}
              </div>
            </div>
            <h3 className="mt-5 sm:mt-7 font-display font-bold text-[26px] sm:text-[42px] lg:text-[48px] leading-[1.03] tracking-tight max-w-xl text-ink">
              {card.title}
            </h3>
            <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-ink/70 max-w-lg">
              {card.body}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-ink group/btn cursor-pointer">
              <span className="relative">
                Explorer ce pilier
                <span
                  className="absolute left-0 -bottom-0.5 h-px w-full origin-right scale-x-0 transition-transform duration-300 group-hover/btn:origin-left group-hover/btn:scale-x-100"
                  style={{ backgroundColor: card.accent }}
                />
              </span>
              <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </div>
          </div>
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {big ? <MiniDashboard accent={card.accent} /> : <MiniBars accent={card.accent} />}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MiniDashboard({ accent }: { accent: string }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white shadow-soft p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted2">
          Précision des Insights
        </div>
        <div
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color: accent, backgroundColor: `${accent}1F` }}
        >
          +18%
        </div>
      </div>
      <Sparkline />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Vision", "Plan", "Exécution"].map((l, i) => (
          <div key={l} className="rounded-lg bg-white border border-hair px-2 py-1.5">
            <div className="text-[10px] text-muted2">{l}</div>
            <div className="text-[13px] font-semibold text-ink">{[92, 84, 76][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBars({ accent }: { accent: string }) {
  const vals = [40, 65, 50, 80, 70, 92];
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted2">
          Gain d'Efficacité
        </div>
        <div
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color: accent, backgroundColor: `${accent}1F` }}
        >
          +{vals[vals.length - 1] - vals[0]}%
        </div>
      </div>
      <div className="flex items-end gap-2 h-24">
        {vals.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${v}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-md"
            style={{ backgroundColor: accent, opacity: 0.35 + i * 0.11 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted2">
        <span>T1</span>
        <span>Maintenant</span>
      </div>
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
function About() {
  const tags = ["Propulsé par l'IA", "Analyse en Temps Réel", "Infrastructure Sécurisée", "Accès Mondial", "Surveillance 24/7"];
  return (
    <section id="about" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <motion.div
            whileHover={{ rotate: -1.5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-grad-lavender border border-hair shadow-soft"
          >
            <div className="absolute inset-0 dotted-bg opacity-20 z-10 pointer-events-none" />
            <img
              src={founderImg}
              alt="VertexIQ"
              width={896}
              height={1152}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 z-20 rounded-2xl bg-white/90 backdrop-blur border border-hair p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted2">
                Plateforme
              </div>
              <div className="font-display font-bold text-[20px] mt-1">
                VertexIQ
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-7">
          <Reveal>
            <SectionLabel>À propos</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.04]">
            L'avenir du trading intelligent
          </Reveal>
          <Reveal as="p" delay={0.12} className="mt-6 text-[17px] leading-relaxed text-muted2 max-w-xl">
            VertexIQ a été créé pour rendre la technologie de marché avancée accessible aux traders et aux professionnels du quotidien. En combinant l'intelligence artificielle, l'apprentissage automatique et l'intelligence de marché en temps réel, nous aidons les utilisateurs à prendre des décisions plus rapides, plus intelligentes et plus confiantes.
          </Reveal>
          <Stagger className="mt-8 flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <motion.span
                key={t}
                variants={fadeUp}
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-hair px-4 py-2 text-[13px] text-ink cursor-default"
              >
                <Check className="size-3.5 text-[#A78BFA]" />
                {t}
              </motion.span>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  const items = [
    {
      quote:
        "Brad m'a poussé à sortir de la dépendance opérationnelle et à développer de véritables capacités de leadership. La clarté que j'ai acquise a transformé le fonctionnement de toute mon équipe dirigeante. Les décisions se prennent maintenant sans moi.",
      role: "DG, Fabricant Spécialisé en Ingénierie",
      tint: "bg-grad-lavender",
    },
    {
      quote:
        "Travailler avec Brad a transformé ma façon de diriger et la perception du marché envers notre entreprise. Nous sommes passés d'une vente dirigée par le fondateur à une équipe commerciale pleinement fonctionnelle en dix-huit mois.",
      role: "Plateforme, Entreprise de Sécurité des Centres de Données",
      tint: "bg-grad-pink",
    },
    {
      quote:
        "Nous avons réussi la transition vers un moteur commercial systématisé, augmentant la valeur de l'entreprise de plus de 40 %. L'approche structurée de Brad nous a fourni une feuille de route qui a vraiment fonctionné dans notre secteur spécifique.",
      role: "PDG, Fournisseur Aérospatial de Précision",
      tint: "bg-grad-peach",
    },
    {
      quote:
        "Le Cadre VertexIQ nous a fourni le cadre exact dont nous avions besoin pour nous éloigner des opérations quotidiennes. Pour la première fois en douze ans, j'ai pris des vacances de deux semaines sans décrocher un seul appel.",
      role: "Directeur des Opérations, Services d'Infrastructure",
      tint: "bg-grad-mint",
    },
    {
      quote:
        "Les conseils stratégiques de Brad nous ont aidés à recruter et aligner avec succès notre premier conseil d'administration. Le processus était méthodique. Le résultat était une équipe de direction qui partage genuinement notre vision.",
      role: "DG, Fournisseur d'Équipements de Défense",
      tint: "bg-grad-lavender",
    },
  ];

  // Duplicate items for seamless loop
  const marqueeItems = [...items, ...items, ...items];

  return (
    <section id="success-stories" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-12">
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel>Témoignages de Succès</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[36px] sm:text-[48px] leading-[1.1]">
            Approuvé par des investisseurs du monde entier
          </Reveal>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden py-4 mask-gradient">
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: [0, -1800] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
          whileHover={{ transition: { duration: 100 } }}
        >
          {marqueeItems.map((t, i) => (
            <div
              key={i}
              className="group relative w-[280px] sm:w-[340px] h-[280px] sm:h-[300px] shrink-0 rounded-2xl bg-white border border-hair shadow-soft p-6 sm:p-7 overflow-hidden flex flex-col justify-between"
            >
              <div className={`pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full ${t.tint} blur-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500`} />

              <blockquote className="relative text-[14px] sm:text-[15px] leading-relaxed text-ink/85 font-medium flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="relative flex items-center gap-3 border-t border-hair pt-4 mt-4">
                <div className={`size-7 rounded-full ${t.tint} border border-hair flex-shrink-0`} />
                <div className="text-[11px] text-muted2 font-medium leading-tight">{t.role}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CtaStrip({ onSignUp }: { onSignUp: () => void }) {
  const navigate = useNavigate();
  return (
    <section id="cta" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-[#F7F4FF] border border-[#E4D9FB] shadow-soft p-6 sm:p-10 lg:p-16"
        >
          {/* warm lavender glow overlays */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-32 -right-20 w-[460px] h-[460px] rounded-full bg-[#C4B5FD]/30 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-40 -left-20 w-[460px] h-[460px] rounded-full bg-[#FBE9F1]/80 blur-3xl"
          />
          {/* subtle background styling */}
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-grad-pink blur-[120px] opacity-40 rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="mt-4 sm:mt-5 font-display font-bold text-ink text-[32px] sm:text-[56px] leading-[1.04]">
              Deux façons de commencer
            </h2>
            <p className="mt-5 text-ink/60 text-[16px] max-w-lg">
              Choisissez le chemin qui correspond le mieux à vos objectifs.
            </p>
          </div>

          <Stagger className="relative mt-12 grid md:grid-cols-2 gap-5">
            <CtaCard
              kicker="Accès Gratuit"
              title="Explorer VertexIQ"
              body="Découvrez comment l'analyse intelligente peut améliorer votre prise de décision."
              button="Accès Gratuit"
              variant="diagnostic"
              onClick={onSignUp}
            />
            <CtaCard
              kicker="Consultation Personnelle"
              title="Réserver une Consultation Personnelle"
              body="Découvrez comment VertexIQ peut s'adapter à votre stratégie d'investissement."
              button="Planifier une Consultation"
              variant="conversation"
              onClick={() => { navigate('/contact'); window.scrollTo(0,0); }}
            />
          </Stagger>
        </motion.div>
      </div>
    </section>
  );
}

function CtaCard({
  kicker,
  title,
  body,
  button,
  variant,
  onClick,
}: {
  kicker: string;
  title: string;
  body: string;
  button: string;
  variant: "diagnostic" | "conversation";
  onClick?: () => void;
}) {
  const isDiag = variant === "diagnostic";
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-soft ${
        isDiag
          ? "bg-white border-hair hover:border-[#ccc] text-ink"
          : "bg-ink border-ink text-white"
      }`}
    >
      <div className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${isDiag ? "text-muted2" : "text-white/60"}`}>
        <span className={`size-1.5 rounded-full ${isDiag ? "bg-ink/40" : "bg-white/50"}`} />
        {kicker}
      </div>
      <h3 className={`mt-4 font-display font-bold text-[22px] leading-tight ${isDiag ? "text-ink" : "text-white"}`}>
        {title}
      </h3>
      <p className={`mt-3 text-[14px] leading-relaxed ${isDiag ? "text-muted2" : "text-white"}`}>
        {body}
      </p>
      <Magnetic className="inline-block mt-7">
        <motion.button
          onClick={onClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`group relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold overflow-hidden ${
            isDiag
              ? "bg-ink text-white"
              : "bg-white text-ink"
          }`}
        >
          <span className="relative z-10">{button}</span>
          <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
          <span className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent ${isDiag ? "via-white/15" : "via-ink/10"} to-transparent transition-transform duration-700 group-hover:translate-x-full`} />
        </motion.button>
      </Magnetic>
    </motion.div>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="relative mt-20">
      {/* big CTA wordmark block */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-16 text-center">
        <Reveal as="p" className="text-[12px] tracking-[0.2em] uppercase text-ink/50">
          Prêt à trader plus intelligemment ?
        </Reveal>
        <Reveal as="h2" delay={0.05} className="mt-5 font-display font-bold text-[48px] sm:text-[88px] lg:text-[120px] leading-[0.95] text-ink">
          VERTEXIQ<span className="text-[#A78BFA]">.</span>
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-5 mx-auto max-w-xl text-[15px] text-ink/60">
          Intelligence de marché propulsée par l'IA conçue pour les investisseurs modernes qui recherchent des décisions plus intelligentes et une plus grande confiance.
        </Reveal>
        <Magnetic className="inline-block mt-8">
          <motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink text-white px-7 py-4 text-[14px] font-semibold overflow-hidden"
          >
            <span className="relative z-10">Réserver une Consultation Personnelle</span>
            <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.a>
        </Magnetic>
      </div>

      {/* footer links area */}
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* brand col */}
            <div className="lg:col-span-4">
              <div className="font-display font-bold text-[22px]">
                VERTEXIQ<span className="text-[#A78BFA]">.</span>
              </div>
              <p className="mt-4 text-[14px] text-white/50 max-w-xs">
                Intelligence avancée. Décisions plus intelligentes. Meilleurs résultats.
              </p>
            </div>
            <FooterCol
              title="Entreprise"
              links={[
                { label: "À propos", href: "/#about" },
                { label: "Témoignages", href: "/#success-stories" },
                { label: "Technologie", href: "/#technology" },
                { label: "Contact", href: "/contact" },
              ]}
            />
            <FooterCol
              title="Solutions"
              links={[
                { label: "Analyse de Marché", href: "/#insights" },
                { label: "Insights IA", href: "/#insights" },
                { label: "Outils d'Automatisation", href: "/#technology" },
                { label: "Intelligence des Risques", href: "/#technology" },
                { label: "Suivi des Performances", href: "/#technology" },
              ]}
            />
            <FooterCol
              title="Légal"
              links={[
                { label: "Politique de Confidentialité", href: "/contact" },
                { label: "Conditions d'Utilisation", href: "/contact" },
                { label: "Cookies", href: "/contact" },
              ]}
            />
          </div>
        </div>
        <div className="border-t border-white/10 mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/40">
          <div>© 2026 VertexIQ. Tous droits réservés.</div>
          <div>Conçu pour les traders qui veulent clarté, rapidité et confiance dans chaque décision.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="lg:col-span-2 lg:col-start-auto">
      <div className="text-[12px] uppercase tracking-[0.16em] text-white/40">
        {title}
      </div>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.href} className="text-[14px] text-white/70 hover:text-white transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */
function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted2 ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="size-1.5 rounded-full bg-[#A78BFA]" />
      {children}
    </div>
  );
}



/* ---------------- AUTH MODAL ---------------- */
function AuthModal({ mode, onClose, onSwitchMode }: { mode: 'login' | 'signup', onClose: () => void, onSwitchMode?: (mode: 'login' | 'signup') => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Email incorrect');
      }

      console.log("Login successful:", result.user);
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-6 sm:p-8 overflow-hidden"
      >
        {/* Decorative Crypto/Finance elements */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -right-10 text-[#F3BA2F]/10 pointer-events-none">
          <CircleDollarSign className="w-40 h-40" />
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-5 -left-5 text-[#F7931A]/10 pointer-events-none">
          <Bitcoin className="w-20 h-20" />
        </motion.div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#FAFAFA] hover:bg-[#F0F0F0] transition-colors"
        >
          <X className="size-4" />
        </button>

        {mode === 'signup' && submitted ? (
          <div className="text-center py-10">
            <div className="mx-auto size-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
              <Check className="size-6 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-[24px] text-ink">
              Inscription réussie !
            </h3>
            <p className="mt-3 text-[15px] text-muted2">
              Nous avons bien reçu vos informations. Redirection vers le tableau de bord...
            </p>
          </div>
        ) : mode === 'signup' ? (
          <>
            <div className="mb-8">
              <h3 className="font-display font-bold text-[28px] text-ink">
                Créer un Compte
              </h3>
              <p className="mt-2 text-[14px] text-muted2">
                Rejoignez VertexIQ et accédez à l'analyse intelligente.
              </p>
              {error && (
                <div className="mt-2 text-[14px] text-red-500 font-medium">
                  {error === 'Email already in use' ? 'Email déjà enregistré.' : error}
                  {error === 'Email already in use' && onSwitchMode && (
                    <button 
                      type="button" 
                      onClick={() => onSwitchMode('login')}
                      className="ml-2 underline font-bold"
                    >
                      Se connecter avec cet email
                    </button>
                  )}
                </div>
              )}
            </div>
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Nom Complet</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Adresse Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="jean@exemple.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Numéro de Téléphone</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-3.5 hover:bg-black transition-colors disabled:opacity-70"
              >
                {loading ? 'Chargement...' : 'S\'inscrire'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="font-display font-bold text-[28px] text-ink">
                Connexion
              </h3>
              <p className="mt-2 text-[14px] text-muted2">
                Entrez vos identifiants pour accéder à la plateforme.
              </p>
              {error && <p className="mt-2 text-[14px] text-red-500 font-medium">{error}</p>}
            </div>
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Adresse Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="jean@exemple.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-3.5 hover:bg-black transition-colors disabled:opacity-70"
              >
                {loading ? 'Chargement...' : 'Se Connecter'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- CONTACT PAGE ---------------- */
function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("Contact form submitted:", Object.fromEntries(formData.entries()));
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 lg:pt-40 lg:pb-32 px-6 lg:px-10 max-w-7xl mx-auto min-h-[80vh]">
      <FadeSection className="max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted2">
          <span className="size-1.5 rounded-full bg-[#A78BFA]" />
          Nous Contacter
        </div>
        <h1 className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.05] text-ink">
          Parlons de votre stratégie.
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-muted2">
          Remplissez le formulaire ci-dessous pour contacter l'équipe VertexIQ. Que vous ayez besoin d'une démonstration, d'une consultation ou d'un support technique, nous sommes là pour vous aider.
        </p>

        <div className="mt-12 bg-white rounded-3xl border border-hair shadow-soft p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-10">
              <div className="mx-auto size-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
                <Check className="size-6 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-[24px] text-ink">
                Message Envoyé !
              </h3>
              <p className="mt-3 text-[15px] text-muted2">
                Merci de nous avoir contactés. Un membre de notre équipe vous répondra prochainement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Nom Complet</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Adresse Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="jean@exemple.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Numéro de Téléphone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-4 hover:bg-black transition-colors"
              >
                Envoyer le Message
              </button>
            </form>
          )}
        </div>
      </FadeSection>
    </div>
  );
}

/* ---------------- DASHBOARD (NEW) ---------------- */

function DemoTradingBot() {
  const [data, setData] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [price, setPrice] = useState(48250.00);
  
  // Simulate live data
  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 40 }).map((_, i) => ({
      time: i,
      value: 48000 + Math.random() * 500 - 250 + (i * 10)
    }));
    setData(initialData);
    setPrice(initialData[initialData.length - 1].value);

    // Initial dummy trades
    setTrades([
      { id: 1, type: 'BUY', pair: 'BTC/USD', amount: '0.15', price: '48,120.50', time: 'il y a 2 min', profit: '+12.40$' },
      { id: 2, type: 'SELL', pair: 'ETH/USD', amount: '2.50', price: '2,840.10', time: 'il y a 5 min', profit: '+45.20$' },
      { id: 3, type: 'BUY', pair: 'SOL/USD', amount: '15.00', price: '105.30', time: 'il y a 12 min', profit: '-5.10$' },
    ]);

    const interval = setInterval(() => {
      setData(prev => {
        const lastVal = prev[prev.length - 1].value;
        const change = (Math.random() - 0.45) * 80;
        const newVal = lastVal + change;
        setPrice(newVal);
        const newArr = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: newVal }];
        return newArr;
      });

      // Randomly add a new trade
      if (Math.random() > 0.8) {
        setTrades(prev => {
          const isBuy = Math.random() > 0.5;
          const newTrade = {
            id: Date.now(),
            type: isBuy ? 'BUY' : 'SELL',
            pair: Math.random() > 0.5 ? 'BTC/USD' : 'ETH/USD',
            amount: (Math.random() * 2).toFixed(2),
            price: (48000 + Math.random() * 1000).toFixed(2),
            time: 'À l\'instant',
            profit: `${Math.random() > 0.4 ? '+' : '-'}${(Math.random() * 50).toFixed(2)}$`
          };
          return [newTrade, ...prev].slice(0, 5);
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-[24px] bg-[#0A0E17] text-white shadow-float border border-white/10 overflow-hidden flex flex-col w-full relative">
      <div className="border-b border-white/10 p-4 flex items-center justify-between bg-[#111827] z-10">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#F3BA2F]/20 flex items-center justify-center border border-[#F3BA2F]/30">
            <Terminal className="size-4 text-[#F3BA2F]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-[16px] leading-none">Terminal de Trading Demo</h3>
            <div className="text-[11px] text-[#22C55E] flex items-center gap-1 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              Simulation En Direct
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/50 uppercase tracking-wider">Prix Actuel (BTC)</div>
          <div className={`font-display font-bold text-[20px] transition-colors duration-300 ${price > 48250 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {price.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 flex-1 min-h-[400px]">
        {/* Chart Area */}
        <div className="lg:col-span-2 p-6 border-r border-white/10 relative h-[300px] lg:h-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#A78BFA]/5 to-transparent pointer-events-none" />
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 11 }} tickFormatter={(val) => '$' + val.toLocaleString()} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#A78BFA' }}
                labelStyle={{ display: 'none' }}
                formatter={(val: number) => ['$' + val.toFixed(2), 'Prix']}
              />
              <Line type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={3} dot={false} isAnimationActive={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Trades Area */}
        <div className="lg:col-span-1 bg-[#0f141e] p-5 overflow-y-auto max-h-[300px] lg:max-h-[500px]">
          <div className="text-[11px] text-white/50 uppercase tracking-wider mb-4 flex justify-between items-center">
            <span>Activité Récente du Bot</span>
            <Activity className="size-3.5 text-[#A78BFA]" />
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {trades.map((t) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${t.type === 'BUY' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                      {t.type}
                    </span>
                    <span className="text-[10px] text-white/40">{t.time}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="font-display font-semibold text-[14px]">{t.pair}</div>
                      <div className="text-[12px] text-white/60">{t.amount} @ ${t.price}</div>
                    </div>
                    <div className={`text-[13px] font-bold ${t.profit.startsWith('+') ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {t.profit}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactLeadForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="rounded-[24px] bg-white border border-hair shadow-soft overflow-hidden w-full mt-12 mb-12 relative">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#A78BFA]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-[#F3BA2F]/10 blur-3xl" />

      <div className="grid lg:grid-cols-5 relative z-10">
        {/* Left Info Panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111827] to-[#1E293B] text-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50 mb-5">
            <span className="size-1.5 rounded-full bg-[#A78BFA]" />
            Contactez-nous
          </div>
          <h3 className="font-display font-bold text-[28px] leading-tight mb-4">
            Une question ?<br />Parlons-en.
          </h3>
          <p className="text-[14px] leading-relaxed text-white/60 mb-8">
            Notre équipe d'experts est disponible pour répondre à toutes vos questions concernant nos services, notre plateforme ou votre stratégie d'investissement.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Send className="size-4 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">Email</div>
                <div className="text-[12px] text-white/50">support@vertexiq.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Shield className="size-4 text-[#F3BA2F]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">Support Premium</div>
                <div className="text-[12px] text-white/50">Réponse sous 24h</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Activity className="size-4 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">Disponibilité</div>
                <div className="text-[12px] text-white/50">Lun – Ven, 9h – 18h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-3 p-8 sm:p-10">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-16"
            >
              <div className="size-16 rounded-full bg-[#0E7C4A]/10 flex items-center justify-center mb-5">
                <CheckCircle2 className="size-8 text-[#0E7C4A]" />
              </div>
              <h4 className="font-display font-bold text-[22px] text-ink mb-2">Message envoyé !</h4>
              <p className="text-[14px] text-muted2 max-w-sm">Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-display font-bold text-[22px] text-ink mb-1">Envoyez-nous un message</h3>
                <p className="text-[13px] text-muted2">Remplissez le formulaire et nous reviendrons vers vous rapidement.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink/70 uppercase tracking-wider mb-2">Nom complet</label>
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    required
                    className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#A78BFA]/40 focus:border-[#A78BFA] transition-all placeholder:text-ink/30"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink/70 uppercase tracking-wider mb-2">Adresse email</label>
                  <input
                    type="email"
                    placeholder="jean@exemple.com"
                    required
                    className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#A78BFA]/40 focus:border-[#A78BFA] transition-all placeholder:text-ink/30"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink/70 uppercase tracking-wider mb-2">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#A78BFA]/40 focus:border-[#A78BFA] transition-all placeholder:text-ink/30"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink/70 uppercase tracking-wider mb-2">Sujet</label>
                  <select
                    required
                    className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#A78BFA]/40 focus:border-[#A78BFA] transition-all text-ink/70 cursor-pointer"
                  >
                    <option value="">Choisir un sujet...</option>
                    <option value="general">Question générale</option>
                    <option value="trading">Trading & Signaux</option>
                    <option value="account">Mon compte</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink/70 uppercase tracking-wider mb-2">Votre message</label>
                <textarea
                  placeholder="Décrivez votre demande en détail..."
                  required
                  rows={5}
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#A78BFA]/40 focus:border-[#A78BFA] transition-all resize-none placeholder:text-ink/30"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-xl hover:from-[#9B7AEE] hover:to-[#6D28D9] transition-all font-semibold text-[15px] shadow-lg shadow-[#A78BFA]/20 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 lg:pt-36 pb-24 lg:pb-32 px-6 lg:px-10 max-w-7xl mx-auto min-h-screen relative">
      {/* Background elements */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-grad-lavender blur-3xl opacity-30" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-grad-peach blur-3xl opacity-20" />

      <FadeSection>
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-[36px] sm:text-[48px] text-ink">
              Tableau de bord
            </h1>
            <p className="mt-2 text-[16px] text-muted2">Bienvenue dans l'espace membre VertexIQ.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="rounded-full bg-white border border-hair px-4 py-2 text-[14px] font-medium text-ink hover:bg-[#FAFAFA] transition-colors shadow-sm cursor-pointer relative z-10"
          >
            Déconnexion
          </button>
        </div>
      </FadeSection>

      {/* TOP SECTION: Stats and Info */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <FadeSection className="lg:col-span-2">
          <div className="rounded-[24px] bg-white border border-hair shadow-soft p-6 sm:p-8 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute -right-4 -top-4 text-[#A78BFA]/10 rotate-12">
              <Shield className="w-40 h-40" />
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted2 mb-4">
              <span className="size-1.5 rounded-full bg-[#A78BFA]" />
              À propos de VertexIQ
            </div>
            <h3 className="font-display font-bold text-[26px] mb-3 relative z-10">
              La référence en intelligence de marché
            </h3>
            <p className="text-[15px] leading-relaxed text-muted2 relative z-10 max-w-2xl">
              VertexIQ utilise des algorithmes prédictifs avancés et des modèles d'IA pour analyser les marchés crypto et traditionnels en temps réel. Notre mission est de vous fournir des signaux précis et un avantage stratégique constant sur vos investissements.
            </p>
            <div className="mt-6 flex gap-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3BA2F]/10 text-[#D49C1E] px-4 py-1.5 text-[13px] font-bold">
                <Bitcoin className="w-4 h-4" /> Crypto Focus
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#627EEA]/10 text-[#475EBE] px-4 py-1.5 text-[13px] font-bold">
                <LineChart className="w-4 h-4" /> Actions & ETF
              </span>
            </div>
          </div>
        </FadeSection>
        
        <FadeSection className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-[24px] bg-white border border-hair shadow-soft p-6 flex-1 flex flex-col justify-center">
            <div className="text-[12px] text-muted2 uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-[#A78BFA]" /> Solde Démo
            </div>
            <div className="font-display font-bold text-[32px] text-ink">50 000,00 $</div>
            <div className="text-[12px] text-[#0E7C4A] mt-3 bg-[#0E7C4A]/10 inline-flex px-3 py-1 rounded-full font-bold self-start">
              +2.4% aujourd'hui
            </div>
          </div>
          <div className="rounded-[24px] bg-white border border-hair shadow-soft p-6 flex-1 flex flex-col justify-center">
            <div className="text-[12px] text-muted2 uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3B82F6]" /> Trades Actifs
            </div>
            <div className="font-display font-bold text-[32px] text-ink">3 Ordres</div>
            <div className="text-[12px] text-[#3B82F6] mt-3 bg-[#3B82F6]/10 inline-flex px-3 py-1 rounded-full font-bold self-start">
              Bot Vertex v2.4 Actif
            </div>
          </div>
        </FadeSection>
      </div>

      {/* MIDDLE SECTION: Demo Trading Bot */}
      <FadeSection>
        <DemoTradingBot />
      </FadeSection>

      {/* BOTTOM SECTION: Contact Form */}
      <FadeSection>
        <ContactLeadForm />
      </FadeSection>
    </div>
  );
}
