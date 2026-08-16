const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const templatesData = [
  {
    id: 'tmpl_01',
    category: 'ONBOARDING',
    title: 'Welcome & Quickstart',
    accent: '#E8A33D',
    bg: '#181E24',
    icon: '🚀',
    details: ['1. Import Contacts', '2. Pick Template', '3. Launch Campaign'],
    cta: 'Get Started →'
  },
  {
    id: 'tmpl_02',
    category: 'ONBOARDING',
    title: 'Magic Link Verification',
    accent: '#3B82F6',
    bg: '#141E2E',
    icon: '🔐',
    details: ['Verification Code: 849-201', 'Expires in 30 minutes', 'Secure Workspace Access'],
    cta: 'Verify Email →'
  },
  {
    id: 'tmpl_03',
    category: 'ONBOARDING',
    title: 'Founder Welcome Note',
    accent: '#10B981',
    bg: '#14231E',
    icon: '✍️',
    details: ['Personal note from CEO', 'How can we help you grow?', 'Reply directly to this email'],
    cta: 'Reply to Founder'
  },
  {
    id: 'tmpl_04',
    category: 'PRODUCT UPDATE',
    title: 'Monthly Changelog #14',
    accent: '#06B6D4',
    bg: '#122228',
    icon: '⚡',
    details: ['• Real-time Open Tracking', '• AI Subject Line Copilot', '• Sub-second Scheduler'],
    cta: 'Read Changelog →'
  },
  {
    id: 'tmpl_05',
    category: 'FEATURE RELEASE',
    title: 'AI Copy Studio Unveil',
    accent: '#8B5CF6',
    bg: '#1E162E',
    icon: '🤖',
    details: ['• 5 AI Subject Variations', '• Automated Email Copy', '• Spam Risk Scoring'],
    cta: 'Try AI Studio →'
  },
  {
    id: 'tmpl_06',
    category: 'SERVICE ADVISORY',
    title: 'Scheduled Maintenance',
    accent: '#F59E0B',
    bg: '#241D12',
    icon: '🛠️',
    details: ['Database cluster upgrade', 'Window: Sunday 02:00 UTC', 'Zero email dispatch delay'],
    cta: 'Check Status Page'
  },
  {
    id: 'tmpl_07',
    category: 'MASTERCLASS',
    title: 'Deliverability Secrets',
    accent: '#EC4899',
    bg: '#28131E',
    icon: '📡',
    details: ['99.4% Inbox Placement', 'Thursday, 2:00 PM EST', 'Live Q&A with ISP Experts'],
    cta: 'Reserve Seat Free'
  },
  {
    id: 'tmpl_08',
    category: 'ANNUAL EVENT',
    title: 'MailPilot Summit 2026',
    accent: '#3B82F6',
    bg: '#131D2D',
    icon: '🎪',
    details: ['2,500+ SaaS Founders', 'Keynotes & Workshops', 'Early Bird Pass Open'],
    cta: 'Get Early Pass →'
  },
  {
    id: 'tmpl_09',
    category: 'MILESTONE',
    title: '10M Emails Celebration',
    accent: '#F59E0B',
    bg: '#251F14',
    icon: '🎉',
    details: ['10,000,000 Delivered', 'Special $50 Credit Gift', 'Promo Code: PILOT10M'],
    cta: 'Claim $50 Credit'
  },
  {
    id: 'tmpl_10',
    category: 'NEWSLETTER',
    title: 'SaaS Growth Digest #48',
    accent: '#E8A33D',
    bg: '#1F1B14',
    icon: '💡',
    details: ['Scaling to $50k MRR', 'Milestone Drip Sequences', 'Curated Founder Reads'],
    cta: 'Read Digest →'
  },
  {
    id: 'tmpl_11',
    category: 'BENCHMARK REPORT',
    title: '2026 Deliverability Stats',
    accent: '#10B981',
    bg: '#13231B',
    icon: '📊',
    details: ['Avg Open Rate: 38.4%', 'Click-to-Open: 14.2%', '24-Page PDF Download'],
    cta: 'Download PDF Report'
  },
  {
    id: 'tmpl_12',
    category: 'URGENT OFFER',
    title: 'Trial Expiration (48h)',
    accent: '#EF4444',
    bg: '#261414',
    icon: '⏳',
    details: ['Trial ending in 48 hours', 'Save 20% on Annual Plan', 'Coupon Code: PILOT20'],
    cta: 'Upgrade Workspace'
  },
  {
    id: 'tmpl_13',
    category: 'SPECIAL PROMO',
    title: 'Black Friday 50% Off',
    accent: '#F59E0B',
    bg: '#0F172A',
    icon: '⚡',
    details: ['50% Off All Annual Plans', 'Unlimited Subscribers', '72 Hours Flash Sale'],
    cta: 'Claim 50% Off →'
  },
  {
    id: 'tmpl_14',
    category: 'ENTERPRISE',
    title: 'Scale & High Volume',
    accent: '#6366F1',
    bg: '#181A2D',
    icon: '🏢',
    details: ['Dedicated IP Pool', 'Custom DMARC & BIMI', '99.99% Uptime SLA'],
    cta: 'Review Architecture'
  },
  {
    id: 'tmpl_15',
    category: 'TRANSACTIONAL',
    title: 'Invoice & Receipt #INV',
    accent: '#10B981',
    bg: '#15211B',
    icon: '🧾',
    details: ['Scale & Growth Plan', 'Amount: $49.00 USD', 'Paid via Visa •••• 4242'],
    cta: 'Download PDF Receipt'
  },
  {
    id: 'tmpl_16',
    category: 'SECURITY',
    title: 'New Device Sign-in',
    accent: '#EF4444',
    bg: '#261515',
    icon: '🛡️',
    details: ['Device: Chrome on macOS', 'Location: San Francisco, CA', 'IP: 198.51.100.44'],
    cta: 'Review Activity'
  },
  {
    id: 'tmpl_17',
    category: 'FEEDBACK & NPS',
    title: 'Customer NPS Survey',
    accent: '#22C55E',
    bg: '#132319',
    icon: '💬',
    details: ['Rate Experience (1 - 10)', 'How likely to recommend?', 'Direct founder feedback'],
    cta: 'Submit Rating (1-10)'
  },
  {
    id: 'tmpl_18',
    category: 'USER RESEARCH',
    title: '15-min Roadmap Call',
    accent: '#E8A33D',
    bg: '#221C14',
    icon: '🎯',
    details: ['Help shape next features', '15-min product chat', '$50 Amazon Gift Card'],
    cta: 'Book 15 Mins →'
  },
  {
    id: 'tmpl_19',
    category: 'RE-ENGAGEMENT',
    title: 'We Miss You! (Win-back)',
    accent: '#3B82F6',
    bg: '#131E2A',
    icon: '👋',
    details: ['Check out what is new', 'AI Copy Studio active', 'Your audience is waiting'],
    cta: 'Resume Broadcasting'
  },
  {
    id: 'tmpl_20',
    category: 'DRAFT RECOVERY',
    title: 'Unfinished Broadcast',
    accent: '#E8A33D',
    bg: '#201A12',
    icon: '✍️',
    details: ['Saved campaign draft', 'One click to dispatch', 'Deliverability pre-checked'],
    cta: 'Finish & Send Draft'
  }
];

templatesData.forEach((t) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad_${t.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg}" />
      <stop offset="100%" stop-color="#0F1318" />
    </linearGradient>
    <linearGradient id="accentGrad_${t.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.accent}CC" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="400" height="240" rx="12" fill="url(#bgGrad_${t.id})" />
  
  <!-- Subtle Grid Pattern -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="40" x2="400" y2="40" />
    <line x1="0" y1="80" x2="400" y2="80" />
    <line x1="0" y1="120" x2="400" y2="120" />
    <line x1="0" y1="160" x2="400" y2="160" />
    <line x1="0" y1="200" x2="400" y2="200" />
    <line x1="80" y1="0" x2="80" y2="240" />
    <line x1="160" y1="0" x2="160" y2="240" />
    <line x1="240" y1="0" x2="240" y2="240" />
    <line x1="320" y1="0" x2="320" y2="240" />
  </g>

  <!-- Inner Email Document Frame -->
  <rect x="24" y="20" width="352" height="200" rx="8" fill="#1C2128" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" filter="url(#cardShadow)" />
  
  <!-- Email Top Window Bar -->
  <rect x="24" y="20" width="352" height="28" rx="8" fill="#16191E" />
  <circle cx="42" cy="34" r="3.5" fill="#EF4444" opacity="0.8"/>
  <circle cx="54" cy="34" r="3.5" fill="#F59E0B" opacity="0.8"/>
  <circle cx="66" cy="34" r="3.5" fill="#10B981" opacity="0.8"/>
  
  <!-- Subject / Category Badge -->
  <rect x="250" y="25" width="114" height="18" rx="4" fill="${t.accent}" fill-opacity="0.15" stroke="${t.accent}" stroke-opacity="0.3" />
  <text x="307" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" fill="${t.accent}" text-anchor="middle" letter-spacing="0.5">${t.category}</text>

  <!-- Email Body Content Mockup -->
  <!-- Left Icon Area -->
  <rect x="42" y="60" width="40" height="40" rx="8" fill="${t.accent}" fill-opacity="0.2" stroke="${t.accent}" stroke-opacity="0.4" />
  <text x="62" y="86" font-family="sans-serif" font-size="20" text-anchor="middle">${t.icon}</text>

  <!-- Title & Headline -->
  <text x="94" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">${t.title}</text>
  <text x="94" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="500" fill="#94A3B8">MailPilot Production Email Template</text>

  <!-- Content Bullet Lines -->
  <g transform="translate(42, 114)">
    <circle cx="4" cy="4" r="2.5" fill="${t.accent}" />
    <text x="14" y="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#CBD5E1">${t.details[0]}</text>
    
    <circle cx="4" cy="22" r="2.5" fill="${t.accent}" />
    <text x="14" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#CBD5E1">${t.details[1]}</text>
    
    <circle cx="4" cy="40" r="2.5" fill="${t.accent}" />
    <text x="14" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#CBD5E1">${t.details[2]}</text>
  </g>

  <!-- Action CTA Button in Email -->
  <rect x="42" y="174" width="130" height="28" rx="6" fill="url(#accentGrad_${t.id})" />
  <text x="107" y="192" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#14171C" text-anchor="middle">${t.cta}</text>

  <!-- Sender Signature Stamp -->
  <text x="360" y="192" font-family="monospace" font-size="9" fill="#64748B" text-anchor="end">MailPilot ESP 2.0</text>
</svg>`;

  fs.writeFileSync(path.join(outputDir, `${t.id}.svg`), svg);
});

console.log(`✅ Successfully generated 20 template preview SVG cards in: ${outputDir}`);
