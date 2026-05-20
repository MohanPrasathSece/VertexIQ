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
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  type Variants,
} from "motion/react";
import { useRef, useState, type ReactNode, type MouseEvent } from "react";

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-clip">
      <Nav />
      <FadeSection>
        <Hero />
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
        <CtaStrip />
      </FadeSection>
      <FadeSection>
        <Footer />
      </FadeSection>
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Home", "About", "The Method", "Case Studies", "Blog", "Contact"];
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
              VETERUS<span className="text-[#A78BFA]">.</span>
            </a>
            <nav className="hidden lg:flex items-center gap-9 text-[14px] text-muted2">
              {links.map((l) => (
                <a
                  key={l}
                  href="#"
                  className="relative group hover:text-ink transition-colors"
                >
                  {l}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Magnetic className="hidden sm:block">
                <motion.a
                  href="#cta"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-[13px] font-medium overflow-hidden"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="relative z-10">Book Strategy Call</span>
                  <ArrowRight className="relative z-10 size-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.a>
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
                VETERUS<span className="text-[#A78BFA]">.</span>
              </a>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-6">
              {links.map((l, i) => (
                <motion.a
                  key={l}
                  href="#"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-bold text-[32px] hover:text-[#A78BFA] transition-colors"
                >
                  {l}
                </motion.a>
              ))}
            </nav>
            <div className="px-8 pb-10">
              <a
                href="#cta"
                onClick={() => setMenuOpen(false)}
                className="group relative inline-flex items-center gap-2 rounded-full bg-white text-ink px-7 py-4 text-[14px] font-semibold overflow-hidden w-full justify-center"
              >
                <span className="relative z-10">Book a Strategy Call</span>
                <ArrowRight className="relative z-10 size-4" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* static gradient blobs — no JS scroll tracking, paint once */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-grad-lavender blur-2xl opacity-50" />
      <div className="pointer-events-none absolute top-40 -left-32 w-[480px] h-[480px] rounded-full bg-grad-pink blur-2xl opacity-40" />
      <div className="pointer-events-none absolute inset-0 dotted-bg opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-28 lg:pt-32 pb-24 lg:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* LEFT */}
        <Stagger className="lg:col-span-6">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted2"
          >
            <span className="size-1.5 rounded-full bg-[#A78BFA]" />
            Strategic Advisory for Engineering-Led Businesses
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display font-bold leading-[1.05] tracking-tight"
          >
            <span className="block text-[40px] sm:text-[50px] lg:text-[60px] text-ink">
              Build a Business
            </span>
            <span className="block text-[40px] sm:text-[50px] lg:text-[60px] relative text-ink">
              That{" "}
              <span className="relative">
                <span className="relative z-10">Performs</span>
                <span
                  className="absolute left-0 bottom-0.5 w-full h-[5px] rounded-full opacity-60"
                  style={{ background: "linear-gradient(90deg, #A78BFA, #EC4899)" }}
                />
              </span>
            </span>
            <span className="block text-[40px] sm:text-[50px] lg:text-[60px] text-ink/40">
              Without You
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-7 text-[15px] leading-relaxed text-muted2 max-w-md"
          >
            We help engineering founders remove operational dependency, build
            self-managing teams, grow enterprise value so the business
            thrives with or without you.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Magnetic>
              <motion.a
                href="#cta"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 rounded-full px-7 py-4 text-[14px] font-semibold text-white overflow-hidden"
                style={{ backgroundColor: "#111111" }}
              >
                <span className="relative z-10">Book a Strategy Call</span>
                <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.a>
            </Magnetic>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[12px] text-muted2">
            Trusted by founders in engineering, manufacturing, construction &amp; defence.
          </motion.p>
        </Stagger>

        {/* RIGHT — dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="lg:col-span-6 relative h-[560px] lg:h-[640px]"
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
    { name: "McKinsey", svg: "M4 20V4h2.4l5.6 12L17.6 4H20v16h-2V8.2L12.6 18h-1.2L6 8.2V20H4z" },
    { name: "Deloitte", svg: "M12 4a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" },
    { name: "Accenture", svg: "M2 18L12 4l10 14H2zm4.5-2h11L12 7.5 6.5 16z" },
    { name: "BCG", svg: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" },
    { name: "PwC", svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z" },
    { name: "EY", svg: "M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" },
    { name: "Bain", svg: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5z" },
    { name: "Goldman", svg: "M4 8h16v8H4V8zm2 2v4h12v-4H6z" },
  ];

  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-12 border-y border-hair overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-6">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted2 text-center">
          Trusted by leaders from
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
      <div className="w-[90%] max-w-[460px] rounded-[28px] bg-white border border-hair shadow-float p-7 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted2">
              Executive Overview
            </div>
            <div className="mt-1 font-display font-bold text-[22px]">
              Performance
            </div>
          </div>
          <div className="size-10 rounded-full bg-grad-lavender flex items-center justify-center">
            <Sparkles className="size-4 text-[#6F4FD0]" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#FAFAFA] border border-hair p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[12px] text-muted2">Enterprise Value</div>
              <div className="font-display font-bold text-[28px] leading-none mt-1">
                £12.4M
              </div>
            </div>
            <div className="text-[12px] font-medium text-[#0E7C4A] flex items-center gap-1">
              <TrendingUp className="size-3.5" /> +28.4%
            </div>
          </div>
          <Sparkline />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricMini label="Leadership Score" value="84/100" trend="+6" />
          <MetricMini label="Ops Independence" value="72%" trend="+11" />
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
      title: "Founder Bottleneck",
      body: "Your senior team still waits for your decisions before acting.",
    },
    {
      icon: Gauge,
      title: "Pressure Instead of Freedom",
      body: "Revenue grows, but so does operational dependency on you.",
    },
    {
      icon: UserCheck,
      title: "Failed Leadership Hires",
      body: "You've hired senior people before, but nothing truly changed.",
    },
    {
      icon: TrendingUp,
      title: "Low Enterprise Value",
      body: "The business cannot scale independently from the founder.",
    },
  ];
  return (
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionLabel>Common Challenges</SectionLabel>
        </Reveal>
        <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <Reveal as="h2" className="font-display font-bold text-[40px] sm:text-[52px] leading-[1.05] max-w-2xl">
            Why Growth Still Feels Heavy
          </Reveal>
          <Reveal as="p" delay={0.1} className="text-muted2 max-w-md text-[16px]">
            The patterns we see repeatedly inside engineering-led businesses that
            have outgrown their founder's operational capacity.
          </Reveal>
        </div>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group rounded-3xl bg-white border border-hair p-7 hover:shadow-soft hover:border-[#D8D8D8] transition-[box-shadow,border-color]"
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
                Learn more <ArrowUpRight className="size-3.5 ml-1" />
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
      title: "Strategic Clarity",
      body: "Define a sharp, defensible direction the entire business can align behind.",
      icon: Compass,
      tint: "bg-grad-lavender",
      accent: "#A78BFA",
    },
    {
      title: "Leadership Capability",
      body: "Build a senior team that owns outcomes, not just tasks.",
      icon: Crown,
      tint: "bg-grad-pink",
      accent: "#E58FB2",
    },
    {
      title: "Commercial Maturity",
      body: "Move from owner-led selling to a repeatable commercial engine.",
      icon: Briefcase,
      tint: "bg-grad-peach",
      accent: "#F0A878",
    },
    {
      title: "Operational Leverage",
      body: "Systems, rhythm, accountability that compound without your input.",
      icon: Layers,
      tint: "bg-grad-mint",
      accent: "#7BB7A2",
    },
    {
      title: "Enterprise Value & Optionality",
      body: "Engineer the business so it's investable, sellable, or freely operable.",
      icon: Sparkles,
      tint: "bg-grad-lavender",
      accent: "#8B6FE0",
    },
  ];

  return (
    <section className="relative py-28 lg:py-36 overflow-clip">
      <div className="pointer-events-none absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-grad-lavender blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal>
            <SectionLabel center>The Method</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.04]">
            <>
              The Freedom Blueprint
              <sup className="text-[20px] sm:text-[28px] align-super">™</sup>
            </>
          </Reveal>
          <Reveal as="p" delay={0.12} className="mt-5 text-muted2 text-[17px]">
            A structured framework for transforming founder-led businesses into
            scalable enterprises.
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

        <div className="relative grid lg:grid-cols-12 gap-8 p-7 sm:p-10 lg:p-14 items-center min-h-[420px] lg:min-h-[460px]">
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
            <h3 className="mt-7 font-display font-bold text-[30px] sm:text-[42px] lg:text-[48px] leading-[1.03] tracking-tight max-w-xl text-ink">
              {card.title}
            </h3>
            <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-ink/70 max-w-lg">
              {card.body}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-ink group/btn cursor-pointer">
              <span className="relative">
                Explore this pillar
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
          Alignment Index
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
        {["Vision", "Plan", "Execution"].map((l, i) => (
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
          Quarterly Lift
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
        <span>Q1</span>
        <span>Now</span>
      </div>
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
function About() {
  const tags = ["CEng", "MSc", "Royal Navy", "DISC Certified", "20+ Years Experience"];
  return (
    <section className="relative py-28 lg:py-36">
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
              alt="Brad - External Chairman"
              width={896}
              height={1152}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-5 left-5 right-5 z-20 rounded-2xl bg-white/90 backdrop-blur border border-hair p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted2">
                Founder
              </div>
              <div className="font-display font-bold text-[20px] mt-1">
                Brad - External Chairman
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-7">
          <Reveal>
            <SectionLabel>About</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.04]">
            Your External Chairman
          </Reveal>
          <Reveal as="p" delay={0.12} className="mt-6 text-[17px] leading-relaxed text-muted2 max-w-xl">
            I'm a Chartered Engineer and former Royal Navy officer with 25+ years
            inside engineering-led organisations. I work closely with founders to
            build businesses that perform without heroic effort.
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
        "Brad challenged me to step out of operational dependency and build real leadership capability. The clarity I gained transformed how my entire senior team operates. Decisions now happen without me.",
      role: "MD, Specialist Engineering Manufacturer",
      tint: "bg-grad-lavender",
    },
    {
      quote:
        "Working with Brad transformed how I lead and how the market perceives our business. We went from founder-led sales to a fully functioning commercial team within eighteen months of working together.",
      role: "Founder, Data Centre Safety Business",
      tint: "bg-grad-pink",
    },
    {
      quote:
        "We successfully transitioned to a systemised commercial engine, increasing enterprise value by over 40%. Brad's structured approach gave us a roadmap that actually worked in our specific sector.",
      role: "CEO, Precision Aerospace Supplier",
      tint: "bg-grad-peach",
    },
    {
      quote:
        "The Freedom Blueprint gave us the exact framework we needed to step away from day-to-day operations. For the first time in twelve years, I took a two-week holiday without fielding a single call.",
      role: "Ops Director, Infrastructure Services",
      tint: "bg-grad-mint",
    },
    {
      quote:
        "Brad's strategic guidance helped us recruit and align our first board of directors successfully. The process was methodical. The result was a leadership team that genuinely shares our vision.",
      role: "MD, Defence Equipment Supplier",
      tint: "bg-grad-lavender",
    },
  ];

  // Duplicate items for seamless loop
  const marqueeItems = [...items, ...items, ...items];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-12">
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel>Voices</SectionLabel>
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mt-6 font-display font-bold text-[36px] sm:text-[48px] leading-[1.1]">
            Trusted by founders who needed more than advice.
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
              className="group relative w-[340px] h-[300px] shrink-0 rounded-2xl bg-white border border-hair shadow-soft p-7 overflow-hidden flex flex-col justify-between"
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
function CtaStrip() {
  return (
    <section id="cta" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] bg-[#F7F4FF] border border-[#E4D9FB] shadow-soft p-10 lg:p-16"
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

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-muted2">
              <span className="size-1.5 rounded-full bg-ink/30" />
              Get Started
            </div>
            <h2 className="mt-5 font-display font-bold text-ink text-[40px] sm:text-[56px] leading-[1.04]">
              Two Ways to Start
            </h2>
            <p className="mt-5 text-ink/60 text-[16px] max-w-lg">
              Pick the entry point that fits where you are right now. Both lead
              to the same outcome: a business that performs without you.
            </p>
          </div>

          <Stagger className="relative mt-12 grid md:grid-cols-2 gap-5">
            <CtaCard
              kicker="Diagnostic"
              title="Find Your Founder Dependency Score"
              body="Five minutes. Immediate clarity."
              button="Take the Diagnostic"
              variant="diagnostic"
            />
            <CtaCard
              kicker="Conversation"
              title="Book a Strategy Conversation"
              body="30 minutes focused on your business."
              button="Schedule Your Call"
              variant="conversation"
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
}: {
  kicker: string;
  title: string;
  body: string;
  button: string;
  variant: "diagnostic" | "conversation";
}) {
  const isDiag = variant === "diagnostic";
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`rounded-3xl p-8 border transition-all duration-300 shadow-soft ${
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
        <motion.a
          href="#"
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
        </motion.a>
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
          Ready to step back?
        </Reveal>
        <Reveal as="h2" delay={0.05} className="mt-5 font-display font-bold text-[56px] sm:text-[88px] lg:text-[120px] leading-[0.95] text-ink">
          VETERUS<span className="text-[#A78BFA]">.</span>
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-5 mx-auto max-w-xl text-[15px] text-ink/60">
          Strategic advisory for engineering-led founders who want a business that performs without them.
        </Reveal>
        <Magnetic className="inline-block mt-8">
          <motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink text-white px-7 py-4 text-[14px] font-semibold overflow-hidden"
          >
            <span className="relative z-10">Book a Conversation</span>
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
                VETERUS<span className="text-[#A78BFA]">.</span>
              </div>
              <p className="mt-4 text-[14px] text-white/50 max-w-xs">
                Strategic advisory for founders ready to build enterprise value.
              </p>
            </div>
            <FooterCol
              title="Company"
              links={["About Brad", "Success Stories", "Book a Strategy Call", "Contact"]}
            />
            <FooterCol
              title="Advisory"
              links={[
                "Manufacturing Advisory",
                "Engineering Advisory",
                "Construction Advisory",
                "Leadership Advisory",
                "The Freedom Blueprint™",
              ]}
            />
            <FooterCol title="Legal" links={["Privacy Policy", "Terms", "Cookies"]} />
          </div>
        </div>
        <div className="border-t border-white/10 mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/40">
          <div>© 2026 Veterus Business Growth. All rights reserved.</div>
          <div>Built for founders ready to step back.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="lg:col-span-2 lg:col-start-auto">
      <div className="text-[12px] uppercase tracking-[0.16em] text-white/40">
        {title}
      </div>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-[14px] text-white/70 hover:text-white transition-colors">
              {l}
            </a>
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
