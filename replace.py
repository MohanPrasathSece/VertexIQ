import re

file_path = 'src/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # Nav links
    ('const links = ["Home", "About", "The Method", "Case Studies", "Blog", "Contact"];',
     'const links = ["Home", "About", "Technology", "Success Stories", "Insights", "Contact"];'),
    ('VETERUS<span className="text-[#A78BFA]">.</span>',
     'VERTEXIQ<span className="text-[#A78BFA]">.</span>'),
    ('Book Strategy Call', 'Get Started'),
    ('Book a Strategy Call', 'Get Started'),

    # Hero
    ('Strategic Advisory for Engineering-Led Businesses', 'Intelligent Trading & AI-Powered Market Solutions'),
    ('Build a Business', 'Trade Smarter.'),
    ('That{" "}', 'Move{" "}'),
    ('Performs', 'Faster.'),
    ('Without You', 'Grow Confidently.'),
    ('We help engineering founders remove operational dependency, build\n            self-managing teams, grow enterprise value so the business\n            thrives with or without you.', 'VertexIQ combines advanced artificial intelligence, real-time analytics, and automated market intelligence to help traders identify opportunities, reduce complexity, and make data-driven decisions with confidence.'),
    ('Trusted by founders in engineering, manufacturing, construction &amp; defence.', 'Trusted by traders, investors, and technology-driven professionals worldwide.'),

    # Logos
    ('name: "McKinsey"', 'name: "United Kingdom"'),
    ('name: "Deloitte"', 'name: "Canada"'),
    ('name: "Accenture"', 'name: "Germany"'),
    ('name: "BCG"', 'name: "Australia"'),
    ('name: "PwC"', 'name: "Singapore"'),
    ('name: "EY"', 'name: "France"'),
    ('name: "Bain"', 'name: "Netherlands"'),
    ('name: "Goldman"', 'name: "UAE"'),
    ('Trusted by leaders from', 'Trusted by users across'),

    # Dashboard Mockup
    ('Executive Overview', 'Platform Overview'),
    ('>Performance<', '>Market Intelligence<'),
    ('Enterprise Value', 'AI Accuracy'),
    ('£12.4M', '94.8%'),
    ('+28.4%', '+18.2%'),
    ('Leadership Score', 'Signal Performance'),
    ('84/100', '89/100'),
    ('+6', '+9'),
    ('Ops Independence', 'Automation Efficiency'),
    ('72%', '96%'),
    ('+11', '+14'),

    # Problem Section
    ('Common Challenges', 'Common Challenges'),
    ('Why Growth Still Feels Heavy', 'Why Trading Feels Complicated'),
    ('The patterns we see repeatedly inside engineering-led businesses that\n            have outgrown their founder\'s operational capacity.', 'The challenges many investors face when navigating modern financial markets.'),
    ('Founder Bottleneck', 'Information Overload'),
    ('Your senior team still waits for your decisions before acting.', 'Thousands of market signals make it difficult to identify meaningful opportunities.'),
    ('Pressure Instead of Freedom', 'Emotional Decision Making'),
    ('Revenue grows, but so does operational dependency on you.', 'Fear and uncertainty often lead to missed opportunities or poor timing.'),
    ('Failed Leadership Hires', 'Slow Analysis'),
    ('You\'ve hired senior people before, but nothing truly changed.', 'Traditional research methods cannot always keep pace with rapidly changing markets.'),
    ('Low Enterprise Value', 'Inconsistent Results'),
    ('The business cannot scale independently from the founder.', 'Without a structured approach, performance often becomes unpredictable.'),

    # Method
    ('SectionLabel center>The Method', 'SectionLabel center>The VertexIQ Framework'),
    ('The Freedom Blueprint', 'The VertexIQ Framework'),
    ('A structured framework for transforming founder-led businesses into\n            scalable enterprises.', 'A modern system designed to simplify decision-making and improve market awareness.'),
    ('Strategic Clarity', 'Market Intelligence'),
    ('Define a sharp, defensible direction the entire business can align behind.', 'Transform massive amounts of market data into clear, actionable insights.'),
    ('Leadership Capability', 'Predictive Analytics'),
    ('Build a senior team that owns outcomes, not just tasks.', 'Identify trends and opportunities before they become obvious to the wider market.'),
    ('Commercial Maturity', 'Automated Monitoring'),
    ('Move from owner-led selling to a repeatable commercial engine.', 'Track markets continuously and receive intelligent alerts in real time.'),
    ('Operational Leverage', 'Risk Optimization'),
    ('Systems, rhythm, accountability that compound without your input.', 'Balance opportunity and protection through smarter risk management.'),
    ('Enterprise Value & Optionality', 'Growth & Performance'),
    ('Engineer the business so it\'s investable, sellable, or freely operable.', 'Build a consistent, data-driven approach designed for long-term success.'),
    ('Alignment Index', 'Insight Accuracy'),
    ('Quarterly Lift', 'Efficiency Gain'),
    
    # About
    ('Your External Chairman', 'The Future of Intelligent Trading'),
    ('I\'m a Chartered Engineer and former Royal Navy officer with 25+ years\n            inside engineering-led organisations. I work closely with founders to\n            build businesses that perform without heroic effort.', 'VertexIQ was created to make advanced market technology accessible to everyday traders and professionals alike. By combining artificial intelligence, machine learning, and real-time market intelligence, we help users make faster, smarter, and more confident decisions.'),
    ('"CEng", "MSc", "Royal Navy", "DISC Certified", "20+ Years Experience"', '"AI-Powered", "Real-Time Analytics", "Secure Infrastructure", "Global Access", "24/7 Monitoring"'),

    # Testimonials
    ('Voices', 'Success Stories'),
    ('Trusted by founders who needed more than advice.', 'Trusted by Investors Worldwide'),

    # CTA
    ('Get Started', 'Get Started'),
    ('Two Ways to Start', 'Two Ways to Begin'),
    ('Pick the entry point that fits where you are right now. Both lead\n              to the same outcome: a business that performs without you.', 'Choose the path that best suits your goals.'),
    ('Diagnostic', 'Free Access'),
    ('Find Your Founder Dependency Score', 'Explore VertexIQ'),
    ('Five minutes. Immediate clarity.', 'Discover how intelligent analytics can enhance your decision-making.'),
    ('Take the Diagnostic', 'Create Account'),
    ('Conversation', 'Personal Consultation'),
    ('Book a Strategy Conversation', 'Speak with our team'),
    ('30 minutes focused on your business.', 'Learn how VertexIQ can fit your investment strategy.'),
    ('Schedule Your Call', 'Schedule Consultation'),

    # Footer
    ('Ready to step back?', 'Ready to Trade Smarter?'),
    ('VETERUS', 'VERTEXIQ'),
    ('Strategic advisory for engineering-led founders who want a business that performs without them.', 'AI-powered market intelligence designed for modern investors seeking smarter decisions and greater confidence.'),
    ('Book a Conversation', 'Get Started'),
    ('Strategic advisory for founders ready to build enterprise value.', 'Advanced intelligence. Smarter decisions. Better outcomes.'),
    ('"About Brad", "Success Stories", "Book a Strategy Call", "Contact"', '"About", "Success Stories", "Technology", "Contact"'),
    ('Advisory', 'Solutions'),
    ('"Manufacturing Advisory",\n                "Engineering Advisory",\n                "Construction Advisory",\n                "Leadership Advisory",\n                "The Freedom Blueprint™",', '"Market Analytics",\n                "AI Insights",\n                "Automation Tools",\n                "Risk Intelligence",\n                "Performance Tracking",'),
    ('Veterus Business Growth', 'VertexIQ'),
    ('Built for founders ready to step back.', 'Built for traders who want clarity, speed, and confidence in every decision.')
]

for old, new in replacements:
    content = content.replace(old, new)

test_old = """const items = [
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
  ];"""

test_new = """const items = [
    {
      quote:
        "VertexIQ transformed how I analyze markets. The insights are faster, clearer, and significantly more accurate than traditional research.",
      role: "Financial Consultant, London",
      tint: "bg-grad-lavender",
    },
    {
      quote:
        "The automated monitoring tools help me stay ahead of market movements without spending hours every day.",
      role: "Private Investor, Toronto",
      tint: "bg-grad-pink",
    },
    {
      quote:
        "The platform simplifies complex data into actionable opportunities. It has become an essential part of my strategy.",
      role: "Professional Trader, Singapore",
      tint: "bg-grad-peach",
    },
    {
      quote:
        "The predictive analytics give me confidence when evaluating new opportunities.",
      role: "Investment Manager, Frankfurt",
      tint: "bg-grad-mint",
    },
  ];"""

content = content.replace(test_old, test_new)

# One more item I missed: the "About Brad" and "Founder - Brad" text
content = content.replace("Brad - External Chairman", "VertexIQ")
content = content.replace("Founder", "Platform")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
