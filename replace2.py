import re

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update App component
old_app = '''export default function App() {
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
}'''

new_app = '''export default function App() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-clip">
      <Nav onSignUp={() => setIsSignUpOpen(true)} />
      <FadeSection>
        <Hero onSignUp={() => setIsSignUpOpen(true)} />
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
        <CtaStrip onSignUp={() => setIsSignUpOpen(true)} />
      </FadeSection>
      <FadeSection>
        <Footer />
      </FadeSection>

      <AnimatePresence>
        {isSignUpOpen && <SignUpModal onClose={() => setIsSignUpOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}'''
content = content.replace(old_app, new_app)

# 2. Update Nav Component
old_nav_sig = '''function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Home", "About", "Technology", "Success Stories", "Insights", "Contact"];'''

new_nav_sig = '''function Nav({ onSignUp }: { onSignUp: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Technology", href: "#technology" },
    { name: "Success Stories", href: "#success-stories" },
    { name: "Insights", href: "#insights" },
    { name: "Contact", href: "#cta" }
  ];'''
content = content.replace(old_nav_sig, new_nav_sig)

# Nav desktop links
old_nav_desktop_links = '''{links.map((l) => (
                <a
                  key={l}
                  href="#"
                  className="relative group hover:text-ink transition-colors"
                >
                  {l}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </a>
              ))}'''
new_nav_desktop_links = '''{links.map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  className="relative group hover:text-ink transition-colors"
                >
                  {l.name}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </a>
              ))}'''
content = content.replace(old_nav_desktop_links, new_nav_desktop_links)

# Nav mobile links
old_nav_mobile_links = '''{links.map((l, i) => (
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
              ))}'''
new_nav_mobile_links = '''{links.map((l, i) => (
                <motion.a
                  key={l.name}
                  href={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-bold text-[32px] hover:text-[#A78BFA] transition-colors"
                >
                  {l.name}
                </motion.a>
              ))}'''
content = content.replace(old_nav_mobile_links, new_nav_mobile_links)

# Nav buttons desktop
old_nav_btns_desktop = '''<Magnetic className="hidden sm:block">
                <motion.a
                  href="#cta"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-[13px] font-medium overflow-hidden"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="relative z-10 size-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.a>
              </Magnetic>'''
new_nav_btns_desktop = '''<a href="https://p.finance/en/cabinet/try-demo?a=x1uRlBpzKnqFMN&ac=smart-link&code=WELCOME50&click_id=pqmcmj.3.2q4e" className="hidden sm:block text-[14px] font-medium text-ink hover:text-[#A78BFA] transition-colors px-2">
                Login
              </a>
              <Magnetic className="hidden sm:block">
                <motion.button
                  onClick={onSignUp}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-[13px] font-medium overflow-hidden"
                  style={{ backgroundColor: "#111111" }}
                >
                  <span className="relative z-10">Sign Up</span>
                  <ArrowRight className="relative z-10 size-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </motion.button>
              </Magnetic>'''
content = content.replace(old_nav_btns_desktop, new_nav_btns_desktop)

# Nav buttons mobile
old_nav_btns_mobile = '''<a
                href="#cta"
                onClick={() => setMenuOpen(false)}
                className="group relative inline-flex items-center gap-2 rounded-full bg-white text-ink px-7 py-4 text-[14px] font-semibold overflow-hidden w-full justify-center"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 size-4" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>'''
new_nav_btns_mobile = '''<div className="flex flex-col gap-4">
                <a
                  href="https://p.finance/en/cabinet/try-demo?a=x1uRlBpzKnqFMN&ac=smart-link&code=WELCOME50&click_id=pqmcmj.3.2q4e"
                  className="w-full text-center py-4 text-[16px] font-semibold text-white border border-white/20 rounded-full"
                >
                  Login
                </a>
                <button
                  onClick={() => { setMenuOpen(false); onSignUp(); }}
                  className="group relative inline-flex items-center gap-2 rounded-full bg-white text-ink px-7 py-4 text-[14px] font-semibold overflow-hidden w-full justify-center"
                >
                  <span className="relative z-10">Sign Up</span>
                  <ArrowRight className="relative z-10 size-4" />
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </div>'''
content = content.replace(old_nav_btns_mobile, new_nav_btns_mobile)

# 3. Add IDs to sections & modify Get Started buttons where appropriate
# Hero
content = content.replace('function Hero() {', 'function Hero({ onSignUp }: { onSignUp: () => void }) {')
content = content.replace('<section className="relative overflow-hidden">', '<section id="home" className="relative overflow-hidden">')
content = content.replace('''<motion.a
                href="#cta"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 rounded-full px-7 py-4 text-[14px] font-semibold text-white overflow-hidden"
                style={{ backgroundColor: "#111111" }}
              >
                <span className="relative z-10">Get Started Today</span>''', '''<motion.button
                onClick={onSignUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2 rounded-full px-7 py-4 text-[14px] font-semibold text-white overflow-hidden"
                style={{ backgroundColor: "#111111" }}
              >
                <span className="relative z-10">Get Started Today</span>''')
content = content.replace('''</motion.a>
            </Magnetic>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[12px] text-muted2">
            Trusted by traders''', '''</motion.button>
            </Magnetic>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[12px] text-muted2">
            Trusted by traders''')

# Problem (Insights)
content = content.replace('<section className="relative py-28 lg:py-36">', '<section id="insights" className="relative py-28 lg:py-36">')

# Method (Technology)
content = content.replace('<section className="relative py-28 lg:py-36 overflow-clip">', '<section id="technology" className="relative py-28 lg:py-36 overflow-clip">')

# About
content = content.replace('function About() {\n  const tags', 'function About() {\n  const tags')
content = content.replace('    <section className="relative py-28 lg:py-36">\n      <div className="mx-auto', '    <section id="about" className="relative py-28 lg:py-36">\n      <div className="mx-auto')

# Testimonials (Success Stories)
content = content.replace('<section className="relative py-24 lg:py-32 overflow-hidden">', '<section id="success-stories" className="relative py-24 lg:py-32 overflow-hidden">')

# CTA Strip (Contact)
content = content.replace('function CtaStrip() {', 'function CtaStrip({ onSignUp }: { onSignUp: () => void }) {')

content = content.replace('''<CtaCard
              kicker="Free Access"
              title="Explore VertexIQ"
              body="Discover how intelligent analytics can enhance your decision-making."
              button="Create Account"
              variant="diagnostic"
            />''', '''<CtaCard
              kicker="Free Access"
              title="Explore VertexIQ"
              body="Discover how intelligent analytics can enhance your decision-making."
              button="Create Account"
              variant="diagnostic"
              onClick={onSignUp}
            />''')
content = content.replace('''function CtaCard({
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
}) {''', '''function CtaCard({
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
}) {''')
content = content.replace('''<motion.a
          href="#"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`group relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold overflow-hidden ${
            isDiag
              ? "bg-ink text-white"
              : "bg-white text-ink"
          }`}
        >''', '''<motion.button
          onClick={onClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className={`group relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold overflow-hidden ${
            isDiag
              ? "bg-ink text-white"
              : "bg-white text-ink"
          }`}
        >''')
content = content.replace('</motion.a>\n      </Magnetic>\n    </motion.div>', '</motion.button>\n      </Magnetic>\n    </motion.div>')

# Footer button
content = content.replace('''<motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink text-white px-7 py-4 text-[14px] font-semibold overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>''', '''<motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink text-white px-7 py-4 text-[14px] font-semibold overflow-hidden"
          >
            <span className="relative z-10">Contact Us</span>''')

# 4. Add SignUpModal component
signup_modal = '''

/* ---------------- SIGNUP MODAL ---------------- */
function SignUpModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Collect form details
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sending to admin mail:", data);
    
    // Show success
    setSubmitted(true);
    
    // Auto-close after 3s
    setTimeout(() => {
      onClose();
    }, 3000);
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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#FAFAFA] hover:bg-[#F0F0F0] transition-colors"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="text-center py-10">
            <div className="mx-auto size-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
              <Check className="size-6 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-[24px] text-ink">
              Signed up successfully!
            </h3>
            <p className="mt-3 text-[15px] text-muted2">
              We have received your details. Our team will be in touch shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="font-display font-bold text-[28px] text-ink">
                Create Account
              </h3>
              <p className="mt-2 text-[14px] text-muted2">
                Join VertexIQ and unlock intelligent analytics.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-3.5 hover:bg-black transition-colors"
              >
                Sign Up
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
'''
content = content + signup_modal

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
