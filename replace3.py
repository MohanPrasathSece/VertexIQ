import re

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace state in App
content = content.replace('const [isSignUpOpen, setIsSignUpOpen] = useState(false);', 'const [authMode, setAuthMode] = useState<\\'login\\' | \\'signup\\' | null>(null);')

# Replace props passed to components
content = content.replace('onSignUp={() => setIsSignUpOpen(true)}', 'onSignUp={() => setAuthMode(\\'signup\\')} onLogin={() => setAuthMode(\\'login\\')}')

# Replace AnimatePresence content
old_animate = '''      <AnimatePresence>
        {isSignUpOpen && <SignUpModal onClose={() => setIsSignUpOpen(false)} />}
      </AnimatePresence>'''
new_animate = '''      <AnimatePresence>
        {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
      </AnimatePresence>'''
content = content.replace(old_animate, new_animate)

# Nav component
content = content.replace('function Nav({ onSignUp }: { onSignUp: () => void }) {', 'function Nav({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {')
content = content.replace('''<a href="https://p.finance/en/cabinet/try-demo?a=x1uRlBpzKnqFMN&ac=smart-link&code=WELCOME50&click_id=pqmcmj.3.2q4e" className="hidden sm:block text-[14px] font-medium text-ink hover:text-[#A78BFA] transition-colors px-2">
                Login
              </a>''', '''<button onClick={onLogin} className="hidden sm:block text-[14px] font-medium text-ink hover:text-[#A78BFA] transition-colors px-2">
                Login
              </button>''')
content = content.replace('''<a
                  href="https://p.finance/en/cabinet/try-demo?a=x1uRlBpzKnqFMN&ac=smart-link&code=WELCOME50&click_id=pqmcmj.3.2q4e"
                  className="w-full text-center py-4 text-[16px] font-semibold text-white border border-white/20 rounded-full"
                >
                  Login
                </a>''', '''<button
                  onClick={() => { setMenuOpen(false); onLogin(); }}
                  className="w-full text-center py-4 text-[16px] font-semibold text-white border border-white/20 rounded-full"
                >
                  Login
                </button>''')

# Hero component
content = content.replace('function Hero({ onSignUp }: { onSignUp: () => void }) {', 'function Hero({ onSignUp, onLogin }: { onSignUp: () => void; onLogin?: () => void }) {')

# CtaStrip component
content = content.replace('function CtaStrip({ onSignUp }: { onSignUp: () => void }) {', 'function CtaStrip({ onSignUp, onLogin }: { onSignUp: () => void; onLogin?: () => void }) {')

# Replace SignUpModal with AuthModal
old_modal = '''function SignUpModal({ onClose }: { onClose: () => void }) {
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
  };'''

new_modal = '''function AuthModal({ mode, onClose }: { mode: 'login' | 'signup', onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sending to admin mail:", data);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Login captured email:", data.email);
    window.location.href = "https://p.finance/en/cabinet/try-demo?a=x1uRlBpzKnqFMN&ac=smart-link&code=WELCOME50&click_id=pqmcmj.3.2q4e";
  };'''

content = content.replace(old_modal, new_modal)

old_modal_return = '''        {submitted ? (
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
        )}'''

new_modal_return = '''        {mode === 'signup' && submitted ? (
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
        ) : mode === 'signup' ? (
          <>
            <div className="mb-8">
              <h3 className="font-display font-bold text-[28px] text-ink">
                Create Account
              </h3>
              <p className="mt-2 text-[14px] text-muted2">
                Join VertexIQ and unlock intelligent analytics.
              </p>
            </div>
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
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
        ) : (
          <>
            <div className="mb-8">
              <h3 className="font-display font-bold text-[28px] text-ink">
                Login
              </h3>
              <p className="mt-2 text-[14px] text-muted2">
                Enter your email to continue to the trading platform.
              </p>
            </div>
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
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
              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-ink text-white font-semibold text-[15px] py-3.5 hover:bg-black transition-colors"
              >
                Next
              </button>
            </form>
          </>
        )}'''

content = content.replace(old_modal_return, new_modal_return)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
