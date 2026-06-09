import re

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hero text size
content = content.replace('className="block text-[40px] sm:text-[50px] lg:text-[60px]', 'className="block text-[34px] sm:text-[48px] lg:text-[60px]')
# 2. Dashboard mockup wrapper
content = content.replace('className="lg:col-span-6 relative h-[560px] lg:h-[640px]"', 'className="lg:col-span-6 relative h-[420px] sm:h-[560px] lg:h-[640px]"')
# 3. Dashboard mockup inner
content = content.replace('className="w-[90%] max-w-[460px] rounded-[28px] bg-white border border-hair shadow-float p-7 relative z-10"', 'className="w-[90%] max-w-[460px] rounded-[28px] bg-white border border-hair shadow-float p-5 sm:p-7 relative z-10"')
content = content.replace('font-display font-bold text-[28px] leading-none mt-1', 'font-display font-bold text-[24px] sm:text-[28px] leading-none mt-1')

# 4. Problem grid gap
content = content.replace('className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"', 'className="mt-10 sm:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"')
content = content.replace('className="group rounded-3xl bg-white border border-hair p-7 hover:shadow-soft hover:border-[#D8D8D8] transition-[box-shadow,border-color]"', 'className="group rounded-3xl bg-white border border-hair p-6 sm:p-7 hover:shadow-soft hover:border-[#D8D8D8] transition-[box-shadow,border-color]"')

# 5. Method sticky cards
content = content.replace('className="relative grid lg:grid-cols-12 gap-8 p-7 sm:p-10 lg:p-14 items-center min-h-[420px] lg:min-h-[460px]"', 'className="relative grid lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-10 lg:p-14 items-center min-h-[380px] sm:min-h-[420px] lg:min-h-[460px]"')
content = content.replace('className="mt-7 font-display font-bold text-[30px] sm:text-[42px] lg:text-[48px] leading-[1.03] tracking-tight max-w-xl text-ink"', 'className="mt-5 sm:mt-7 font-display font-bold text-[26px] sm:text-[42px] lg:text-[48px] leading-[1.03] tracking-tight max-w-xl text-ink"')

# 6. Testimonials marquee
content = content.replace('className="group relative w-[340px] h-[300px] shrink-0 rounded-2xl bg-white border border-hair shadow-soft p-7 overflow-hidden flex flex-col justify-between"', 'className="group relative w-[280px] sm:w-[340px] h-[280px] sm:h-[300px] shrink-0 rounded-2xl bg-white border border-hair shadow-soft p-6 sm:p-7 overflow-hidden flex flex-col justify-between"')

# 7. CtaStrip
content = content.replace('className="relative overflow-hidden rounded-[36px] bg-[#F7F4FF] border border-[#E4D9FB] shadow-soft p-10 lg:p-16"', 'className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-[#F7F4FF] border border-[#E4D9FB] shadow-soft p-6 sm:p-10 lg:p-16"')
content = content.replace('className="mt-5 font-display font-bold text-ink text-[40px] sm:text-[56px] leading-[1.04]"', 'className="mt-4 sm:mt-5 font-display font-bold text-ink text-[32px] sm:text-[56px] leading-[1.04]"')
content = content.replace('className={`rounded-3xl p-8 border transition-all duration-300 shadow-soft', 'className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-soft')

# 8. Footer title
content = content.replace('className="mt-5 font-display font-bold text-[56px] sm:text-[88px] lg:text-[120px] leading-[0.95] text-ink"', 'className="mt-5 font-display font-bold text-[48px] sm:text-[88px] lg:text-[120px] leading-[0.95] text-ink"')

# 9. AuthModal
content = content.replace('className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-8"', 'className="relative w-full max-w-md bg-white rounded-3xl shadow-float p-6 sm:p-8"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
