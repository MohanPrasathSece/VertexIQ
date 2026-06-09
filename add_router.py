import re
import os

# 1. Update main.tsx
main_path = 'src/main.tsx'
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'BrowserRouter' not in main_content:
    main_content = main_content.replace('import App from "./App.tsx";', 'import App from "./App.tsx";\nimport { BrowserRouter } from "react-router-dom";')
    main_content = main_content.replace('<App />', '<BrowserRouter>\n      <App />\n    </BrowserRouter>')
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_content)

# 2. Update App.tsx
app_path = 'src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add imports
if 'react-router-dom' not in app_content:
    app_content = app_content.replace('import { useRef, useState, type ReactNode, type MouseEvent } from "react";', 'import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";\nimport { Routes, Route, Link, useLocation } from "react-router-dom";')

# Rename App to Home and create new App
old_app = '''export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-clip">
      <Nav onSignUp={() => setAuthMode('signup')} onLogin={() => setAuthMode('login')} />
      <FadeSection>
        <Hero onSignUp={() => setAuthMode('signup')} onLogin={() => setAuthMode('login')} />
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
        <CtaStrip onSignUp={() => setAuthMode('signup')} />
      </FadeSection>
      <FadeSection>
        <Footer />
      </FadeSection>

      <AnimatePresence>
        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}'''

new_app = '''function Home({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
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
      </Routes>
      <Footer />
      <AnimatePresence>
        {authMode && (
          <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}'''

app_content = app_content.replace(old_app, new_app)

# Update links array in Nav
old_links = '''  const links = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Technology", href: "#technology" },
    { name: "Success Stories", href: "#success-stories" },
    { name: "Insights", href: "#insights" },
    { name: "Contact", href: "#cta" }
  ];'''
new_links = '''  const links = [
    { name: "Home", href: "/#home" },
    { name: "About", href: "/#about" },
    { name: "Technology", href: "/#technology" },
    { name: "Success Stories", href: "/#success-stories" },
    { name: "Insights", href: "/#insights" },
    { name: "Contact", href: "/contact" }
  ];'''
app_content = app_content.replace(old_links, new_links)

# Update Footer Links
app_content = app_content.replace('["About", "Success Stories", "Technology", "Contact"]', '["About", "Success Stories", "Technology", "Contact"]')
app_content = app_content.replace('''<a href="#" className="text-[14px] text-white/70 hover:text-white transition-colors">
              {l}
            </a>''', '''<Link to={l === "Contact" ? "/contact" : "/#" + l.toLowerCase().replace(" ", "-")} className="text-[14px] text-white/70 hover:text-white transition-colors">
              {l}
            </Link>''')

# Update `<a href={l.href}>` in Nav
app_content = app_content.replace('''<a
                  key={l.name}
                  href={l.href}
                  className="relative group hover:text-ink transition-colors"
                >''', '''<Link
                  key={l.name}
                  to={l.href}
                  className="relative group hover:text-ink transition-colors"
                >''')
app_content = app_content.replace('''{l.name}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </a>''', '''{l.name}
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </Link>''')

app_content = app_content.replace('''<motion.a
                  key={l.name}
                  href={l.href}''', '''<motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-bold text-[24px] hover:text-[#A78BFA] transition-colors"
                >
                  <Link to={l.href} className="block w-full">{l.name === "Success Stories" ? "Stories" : l.name}</Link>
                </motion.div>''')

# Since we replaced the whole block, let's fix the mobile nav to avoid duplicate
# Wait, I'll do a regex or simple replace for mobile Nav.
import re
mobile_nav_pattern = r'<motion\.a\s*key=\{l\.name\}\s*href=\{l\.href\}.*?>\s*\{l\.name === "Success Stories" \? "Stories" : l\.name\}\s*</motion\.a>'
mobile_nav_repl = '''<motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-display font-bold text-[24px] hover:text-[#A78BFA] transition-colors"
                >
                  <Link to={l.href} className="block w-full">{l.name === "Success Stories" ? "Stories" : l.name}</Link>
                </motion.div>'''
app_content = re.sub(mobile_nav_pattern, mobile_nav_repl, app_content, flags=re.DOTALL)

# Add Contact Page component
contact_page = '''

/* ---------------- CONTACT PAGE ---------------- */
function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
          Get In Touch
        </div>
        <h1 className="mt-6 font-display font-bold text-[40px] sm:text-[56px] leading-[1.05] text-ink">
          Let's talk about your strategy.
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-muted2">
          Fill out the form below to get in touch with the VertexIQ team. Whether you need a product demonstration, consultation, or technical support, we're here to help.
        </p>

        <div className="mt-12 bg-white rounded-3xl border border-hair shadow-soft p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-10">
              <div className="mx-auto size-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
                <Check className="size-6 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-[24px] text-ink">
                Message Sent!
              </h3>
              <p className="mt-3 text-[15px] text-muted2">
                Thank you for reaching out. A member of our team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1.5 ml-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-hair bg-[#FAFAFA] px-4 py-3.5 text-[14px] outline-none focus:border-[#A78BFA] transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-4 hover:bg-black transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </FadeSection>
    </div>
  );
}
'''
app_content += contact_page

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Done")
