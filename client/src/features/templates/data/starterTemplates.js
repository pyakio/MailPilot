// MailPilot — 24 Production-Ready Email Templates (Data-Driven Catalog)
// Centralized template definitions across 8 categories with block layout configurations

export const STARTER_TEMPLATES = [
  // ─── 1. ONBOARDING (4 Templates) ──────────────────────────────────────────
  {
    id: 'onb-welcome',
    title: 'Welcome & 3-Step Quickstart',
    category: 'onboarding',
    subject: 'Welcome to MailPilot, {{first_name}} — Let\'s get you set up 🚀',
    previewText: 'Everything you need to launch your first email broadcast in under 5 minutes.',
    thumbnail: '/templates/tmpl_01.svg',
    styles: {
      canvasBg: '#f1f5f9',
      cardBg: '#ffffff',
      primaryColor: '#E8A33D',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT', badge: 'QUICKSTART GUIDE', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Welcome to MailPilot, {{first_name}}!',
          subtitle: 'High-growth email deliverability, real-time analytics, and AI copywriting built for modern SaaS.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: '3 Quick Steps to First Broadcast:',
          items: [
            { icon: '👥', title: '1. Import Audience', text: 'Upload your CSV or sync contacts via REST API.' },
            { icon: '🎨', title: '2. Pick a Template', text: 'Choose from 20+ Canva-style responsive layouts.' },
            { icon: '🚀', title: '3. Send & Track', text: 'Watch open rates, clicks, and telemetry live.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Launch First Campaign →', url: 'https://mailpilot.io/campaigns', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Have questions? Reply directly to this email or visit our help center.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'onb-verify',
    title: 'Magic Link & OTP Verification',
    category: 'onboarding',
    subject: 'Verify your email address for {{workspace_name}}',
    previewText: 'Your one-time security verification code is 849-201.',
    thumbnail: '/templates/tmpl_02.svg',
    styles: {
      canvasBg: '#0f172a',
      cardBg: '#1e293b',
      primaryColor: '#E8A33D',
      textColor: '#f8fafc',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '520px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT SECURITY', badge: 'AUTHENTICATION', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Verify your workspace access',
          subtitle: 'Hi {{first_name}}, please confirm your email to activate your MailPilot account.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'ONE-TIME PASSCODE',
          title: '849 - 201',
          text: 'Valid for 15 minutes. Never share this code with anyone.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Confirm & Sign In Instantly →', url: 'https://mailpilot.io/verify', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'If you did not request this login, please change your password immediately.',
          showUnsubscribe: false,
        },
      },
    ],
  },
  {
    id: 'onb-founder',
    title: 'Founder Personal Welcome Note',
    category: 'onboarding',
    subject: 'Quick note from the founder: Welcome to MailPilot!',
    previewText: 'I saw you just signed up and wanted to say hello personally.',
    thumbnail: '/templates/tmpl_03.svg',
    styles: {
      canvasBg: '#ffffff',
      cardBg: '#ffffff',
      primaryColor: '#0f172a',
      textColor: '#2d3748',
      fontFamily: 'serif',
      borderRadius: '0px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'text',
        content: {
          body: 'Hey {{first_name}},\n\nI noticed you just created your MailPilot account, and I wanted to personally reach out and welcome you to our community.\n\nWe built MailPilot because we were tired of clunky email tools that charge thousands just to send basic product updates. What made you decide to try MailPilot today?\n\nJust hit reply and let me know — I read and answer every email personally.\n\nWarm regards,\n\n**Alex Morgan**\nFounder & CEO, MailPilot',
        },
      },
      {
        id: 'b2',
        type: 'button',
        content: { text: 'Book 1-on-1 Onboarding Call →', url: 'https://cal.com/mailpilot-founder', align: 'left', style: 'outline' },
      },
      {
        id: 'b3',
        type: 'footer',
        content: {
          note: 'Sent directly from Alex Morgan at {{workspace_name}}.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'onb-setup',
    title: 'Complete Your Setup Checklist',
    category: 'onboarding',
    subject: '3 items remaining on your MailPilot checklist',
    previewText: 'Finish setting up SPF, DKIM, and sender signature for 99.8% inbox delivery.',
    thumbnail: '/templates/tmpl_01.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#16a34a',
      textColor: '#0f172a',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT', badge: 'SETUP CHECKLIST (60% DONE)', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'You\'re almost ready to broadcast',
          subtitle: 'Complete these remaining items to ensure your emails bypass spam filters and land in the primary inbox.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'Workspace Action Items:',
          items: [
            { icon: '✅', title: 'Account Verified', text: 'Email and identity confirmed.' },
            { icon: '⏳', title: 'Configure Custom Domain', text: 'Add DNS TXT records for SPF and DKIM.' },
            { icon: '⏳', title: 'Upload Audience CSV', text: 'Import your subscriber contacts.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Go to Settings Checklist →', url: 'https://mailpilot.io/settings', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Need technical assistance with DNS records? Reply to open a priority ticket.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 2. PRODUCT & UPDATES (4 Templates) ───────────────────────────────────
  {
    id: 'prod-launch',
    title: 'Major Product Launch & Feature Unveil',
    category: 'product',
    subject: 'Introducing MailPilot 2.0: AI Studio, Realtime Telemetry & More',
    previewText: 'Our biggest release ever is now live for all workspace operators.',
    thumbnail: '/templates/tmpl_04.svg',
    styles: {
      canvasBg: '#0f1318',
      cardBg: '#1b1e24',
      primaryColor: '#E8A33D',
      textColor: '#f1f5f9',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '620px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT 2.0', badge: 'MAJOR RELEASE', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'The Future of AI Email Marketing is Here',
          subtitle: 'Faster delivery pipelines, visual template builder, and zero spam friction.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'What\'s New in Version 2.0:',
          items: [
            { icon: '🤖', title: 'AI Copy Studio', text: 'Generate high-converting subject lines and full HTML copy in seconds.' },
            { icon: '📊', title: 'Micro-Telemetry', text: 'Track opens, link clicks, device stats, and bounces in real-time.' },
            { icon: '⚡', title: 'ESP Multi-Adapter', text: 'Seamless delivery through Resend, custom SMTP, or enterprise relays.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Explore Version 2.0 Now →', url: 'https://mailpilot.io/dashboard', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'You are receiving this update as an active subscriber of {{workspace_name}}.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'prod-changelog',
    title: 'Monthly Product Changelog & Release Notes',
    category: 'product',
    subject: 'MailPilot Changelog: March 2026 Edition 📦',
    previewText: '12 new features, 8 performance speedups, and full dark-mode UI support.',
    thumbnail: '/templates/tmpl_04.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#3b82f6',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ CHANGELOG', badge: 'MARCH 2026', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'What we shipped this month',
          subtitle: 'Here is a breakdown of all the latest improvements and fixes now live in your dashboard.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: '### ✨ New Capabilities\n- **Drag-and-Drop Visual Studio**: Customizing emails is now 3x faster with live block previews.\n- **Spam Risk Auditor**: Detect risky phrases and punctuation before sending.\n- **Automated Win-Back Triggers**: Reactivate dormant subscribers automatically.\n\n### ⚡ Performance Improvements\n- Database query latency reduced by 42% across analytics dashboards.\n- Webhook ingestion rate increased to 5,000 events/sec.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Read Full Changelog (4 min read) →', url: 'https://mailpilot.io/changelog', align: 'left', style: 'outline' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'MailPilot is continuously updated every Tuesday. Thanks for building with us.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'prod-whatsnew',
    title: 'What\'s New in MailPilot 2.0',
    category: 'product',
    subject: 'Have you tried the new AI Copy Studio yet?',
    previewText: 'Generate subject lines with 90%+ predicted open scores.',
    thumbnail: '/templates/tmpl_05.svg',
    styles: {
      canvasBg: '#fdf4e6',
      cardBg: '#ffffff',
      primaryColor: '#E8A33D',
      textColor: '#14171c',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ FEATURE SPOTLIGHT', badge: 'AI STUDIO', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Say goodbye to writer\'s block',
          subtitle: 'MailPilot\'s AI Assistant writes high-converting email drafts tailored to your SaaS audience.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'POPULAR PROMPT',
          title: '"Generate a 3-part product announcement email for developers"',
          text: 'Ready in under 2 seconds with formatted HTML buttons and bullet points.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Try AI Studio in Your Workspace →', url: 'https://mailpilot.io/ai-workspace', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Included free with all MailPilot plans.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'prod-ai-studio',
    title: 'AI Copy Studio Feature Spotlight',
    category: 'product',
    subject: 'Improve your email open rates by 35% with AI',
    previewText: 'See how top teams use AI Subject Line generator to boost opens.',
    thumbnail: '/templates/tmpl_05.svg',
    styles: {
      canvasBg: '#111827',
      cardBg: '#1f2937',
      primaryColor: '#E8A33D',
      textColor: '#f9fafb',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ AI INSIGHTS', badge: 'DELIVERABILITY', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Subject lines that convert',
          subtitle: 'Our AI analyzes 10,000+ top SaaS emails to recommend subject lines with high curiosity gaps and zero spam triggers.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'Key Benefits:',
          items: [
            { icon: '🎯', title: 'Predicted Open Score', text: 'Get a 1-100 score for every variation before sending.' },
            { icon: '🛡️', title: 'Spam Keyword Shield', text: 'Automatically identifies blacklisted keywords.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Run Free Spam & Subject Audit →', url: 'https://mailpilot.io/ai-workspace', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Powered by MailPilot AI Telemetry.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 3. ANNOUNCEMENTS (3 Templates) ───────────────────────────────────────
  {
    id: 'ann-important',
    title: 'Important Service & Security Advisory',
    category: 'announcement',
    subject: '[Action Required] Scheduled Maintenance Advisory for {{workspace_name}}',
    previewText: 'Brief 15-minute maintenance window on Sunday at 02:00 UTC.',
    thumbnail: '/templates/tmpl_06.svg',
    styles: {
      canvasBg: '#fef2f2',
      cardBg: '#ffffff',
      primaryColor: '#ef4444',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚠️ MAILPILOT ADVISORY', badge: 'CRITICAL NOTICE', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Scheduled Infrastructure Upgrade',
          subtitle: 'We are performing scheduled database optimizations to enhance delivery throughput and system resilience.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'TIMING WINDOW',
          title: 'Sunday, March 29 • 02:00 - 02:15 UTC',
          text: 'Campaign broadcasting will pause during this 15-minute window and resume automatically.',
        },
      },
      {
        id: 'b4',
        type: 'text',
        content: {
          body: '**Impact on your account:**\n- Tracking pixels and click redirects will remain active without interruption.\n- Scheduled campaigns will automatically dispatch immediately after completion.',
        },
      },
      {
        id: 'b5',
        type: 'button',
        content: { text: 'Check Live System Status Page →', url: 'https://status.mailpilot.io', align: 'left', style: 'outline' },
      },
      {
        id: 'b6',
        type: 'footer',
        content: {
          note: 'This is an operational notification sent to all workspace admins.',
          showUnsubscribe: false,
        },
      },
    ],
  },
  {
    id: 'ann-company',
    title: 'Company Milestone & Growth Update',
    category: 'announcement',
    subject: 'We just passed 10,000,000 emails sent! 🎉 Here is a gift for you',
    previewText: 'Thank you for making this journey possible. 5,000 free email credits added to your workspace.',
    thumbnail: '/templates/tmpl_09.svg',
    styles: {
      canvasBg: '#faf5ff',
      cardBg: '#ffffff',
      primaryColor: '#9333ea',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '🎉 10M MILESTONE', badge: 'THANK YOU', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: '10 Million Emails and Counting!',
          subtitle: 'Hi {{first_name}}, today marks an incredible milestone for MailPilot, and we couldn\'t have reached it without you.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'SPECIAL CREDIT',
          title: '5,000 Free Email Credits',
          text: 'Applied automatically to your workspace for your next broadcast campaign.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Claim Your Credits & Launch →', url: 'https://mailpilot.io/dashboard', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'With gratitude from the entire MailPilot team.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'ann-summit',
    title: 'Annual User Summit & Keynote Invitation',
    category: 'announcement',
    subject: 'You\'re invited: MailPilot Virtual Summit 2026 🎤',
    previewText: 'Join 2,500+ SaaS marketers for a live 2-hour masterclass on email growth.',
    thumbnail: '/templates/tmpl_08.svg',
    styles: {
      canvasBg: '#0f172a',
      cardBg: '#1e293b',
      primaryColor: '#E8A33D',
      textColor: '#f8fafc',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '620px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ SUMMIT 2026', badge: 'LIVE VIRTUAL EVENT', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Master Modern Email Deliverability',
          subtitle: 'Keynote speakers from Stripe, Vercel, and OpenAI sharing email tactics that generate 8-figure pipeline.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'Session Highlights:',
          items: [
            { icon: '🎯', title: '99.8% Inbox Placement', text: 'How to bypass Gmail and Outlook promotion tabs.' },
            { icon: '🤖', title: 'AI Personalization', text: 'Dynamic 1-on-1 copy at 100k scale.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Reserve Free Virtual Seat →', url: 'https://summit.mailpilot.io', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Can\'t make it live? Register anyway and we will send you the recording.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 4. NEWSLETTERS (3 Templates) ─────────────────────────────────────────
  {
    id: 'news-weekly',
    title: 'Weekly Growth Digest & Curated Links',
    category: 'newsletter',
    subject: 'The Growth Pilot #42: 5 Email Teardowns & Tactical Frameworks',
    previewText: 'This week: How Linear writes product changelogs that drive 60% adoption.',
    thumbnail: '/templates/tmpl_10.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#0f172a',
      textColor: '#334155',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ THE GROWTH PILOT', badge: 'ISSUE #42 • 5 MIN READ', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'The Anatomy of a 60% Open Rate Email',
          subtitle: 'Welcome to this week\'s edition of curated growth lessons for SaaS operators.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: '### 💡 Top 3 Articles This Week\n\n1. **[The 3-Second Subject Line Test](https://mailpilot.io/blog/subject-test)**\nWhy the first 4 words dictate 80% of your open rate.\n\n2. **[Bypassing Gmail\'s New SPF/DMARC Quarantine](https://mailpilot.io/blog/dmarc-guide)**\nA step-by-step checklist to keep your domain reputation pristine.\n\n3. **[Interactive Email Modules](https://mailpilot.io/blog/amp-emails)**\nHow AMP emails increased survey response rates by 2.4x.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Read the Web Edition →', url: 'https://mailpilot.io/newsletter/42', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Published every Thursday by {{workspace_name}}.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'news-monthly',
    title: 'Monthly SaaS Industry Benchmark Report',
    category: 'newsletter',
    subject: '2026 SaaS Email Benchmark Report: Opens, Clicks & Bounces',
    previewText: 'Data from over 50M emails sent across B2B SaaS in Q1.',
    thumbnail: '/templates/tmpl_11.svg',
    styles: {
      canvasBg: '#f0fdf4',
      cardBg: '#ffffff',
      primaryColor: '#16a34a',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '📊 INDUSTRY REPORT', badge: 'Q1 2026 DATA', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'How does your email performance stack up?',
          subtitle: 'We analyzed 50,000,000+ data points to establish the definitive 2026 email marketing benchmarks.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: '2026 Industry Averages:',
          items: [
            { icon: '📈', title: 'Average Open Rate', text: '34.8% for SaaS product broadcasts.' },
            { icon: '🖱️', title: 'Average Click-to-Open', text: '12.4% for single CTA messages.' },
            { icon: '📉', title: 'Healthy Unsubscribe Rate', text: 'Below 0.2% per send.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Download Full PDF Report (Free) →', url: 'https://mailpilot.io/report', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Compiled by MailPilot Data Intelligence Unit.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'news-insights',
    title: 'Engineering & Deliverability Deep-Dive',
    category: 'newsletter',
    subject: 'Under the Hood: How we scaled to 50k emails/sec',
    previewText: 'Architecture teardown: Redis queues, connection pooling, and multi-tenant isolation.',
    thumbnail: '/templates/tmpl_10.svg',
    styles: {
      canvasBg: '#1e1e2e',
      cardBg: '#181825',
      primaryColor: '#cdd6f4',
      textColor: '#cdd6f4',
      fontFamily: 'monospace',
      borderRadius: '8px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚙️ ARCHITECTURE // NOTES', badge: 'SYS_ENG_04', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Zero-Downtime SMTP Connection Pooling',
          subtitle: 'An engineering deep-dive into how we eliminated rate limit bottlenecks for high-volume broadcasts.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: '```text\n[Client Request] → [HMAC Signer] → [Queue Producer]\n                        ↓\n[Worker Pool (x8)] → [SMTP Multiplexer] → [ESP Relays]\n```\n\nBy implementing persistent TLS connections and adaptive backoff algorithms, we reduced P99 send latency from 1400ms to 85ms.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'View Source & GitHub Discussions →', url: 'https://github.com/pyakio/MailPilot', align: 'left', style: 'outline' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'MailPilot Open Engineering Series.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 5. PROMOTIONAL & SALES (3 Templates) ─────────────────────────────────
  {
    id: 'promo-blackfriday',
    title: 'Black Friday & Cyber Week 50% Off',
    category: 'promotional',
    subject: '⚡ Black Friday: 50% OFF MailPilot Annual Plans (48 Hours Only)',
    previewText: 'Lock in half-price email marketing for life. Ends Sunday midnight.',
    thumbnail: '/templates/tmpl_13.svg',
    styles: {
      canvasBg: '#09090b',
      cardBg: '#18181b',
      primaryColor: '#E8A33D',
      textColor: '#fafafa',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ CYBER WEEK SPECIAL', badge: '50% OFF LIFETIME', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Upgrade to MailPilot Pro at 50% Off',
          subtitle: 'Send unlimited broadcasts, unlock AI Copy Studio, and get dedicated IP warm-up.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'COUPON CODE',
          title: 'CYBER50_ANNUAL',
          text: 'Save $300/year. Valid on all Pro and Enterprise tiers for the next 48 hours.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Claim 50% Discount Now →', url: 'https://mailpilot.io/pricing?code=CYBER50_ANNUAL', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: '30-day money-back guarantee. No questions asked.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'promo-upgrade',
    title: 'Upgrade to Pro: 10x Email Limits',
    category: 'promotional',
    subject: 'You\'ve used 85% of your free email tier for {{workspace_name}}',
    previewText: 'Upgrade to Pro to ensure your upcoming broadcasts are never paused.',
    thumbnail: '/templates/tmpl_14.svg',
    styles: {
      canvasBg: '#eff6ff',
      cardBg: '#ffffff',
      primaryColor: '#2563eb',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ USAGE ADVISORY', badge: '85% REACHED', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Keep your growth unhindered',
          subtitle: 'Hi {{first_name}}, your workspace has sent 850 of 1,000 monthly free emails.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'Why upgrade to Pro:',
          items: [
            { icon: '🚀', title: '50,000 Emails/Mo', text: '10x limit for fast growing subscriber lists.' },
            { icon: '⚡', title: 'Priority Dispatch Queues', text: 'Zero latency delivery during peak hours.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Upgrade to Pro ($29/mo) →', url: 'https://mailpilot.io/settings?tab=billing', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Can cancel or change plans anytime with one click.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'promo-enterprise',
    title: 'Enterprise Plan & Dedicated Infrastructure',
    category: 'promotional',
    subject: 'Scaling to 1M+ emails/month? Let\'s talk dedicated IPs',
    previewText: 'Enterprise SLA, SOC2 compliance, and dedicated delivery architects.',
    thumbnail: '/templates/tmpl_14.svg',
    styles: {
      canvasBg: '#0f172a',
      cardBg: '#1e293b',
      primaryColor: '#E8A33D',
      textColor: '#f8fafc',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT ENTERPRISE', badge: 'HIGH VOLUME', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Enterprise Email Scale & Custom SLAs',
          subtitle: 'Designed for mission-critical platforms delivering millions of transactional and marketing broadcasts.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: '### Enterprise Features Include:\n- **Dedicated IP Pools**: Isolated sender reputation with automated warm-up.\n- **99.99% Uptime SLA**: Direct line to our deliverability engineering team.\n- **Custom Webhook Streaming**: Real-time Kafka / Kinesis telemetry integration.\n- **Multi-Tenant Sub-Accounts**: Manage separate clients and brands in one portal.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Schedule Enterprise Architecture Review →', url: 'https://mailpilot.io/enterprise', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Trusted by high-growth startups and Fortune 500 teams worldwide.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 6. TRANSACTIONAL (2 Templates) ───────────────────────────────────────
  {
    id: 'trans-receipt',
    title: 'Subscription Invoice & Payment Receipt',
    category: 'transactional',
    subject: 'Receipt for your MailPilot Pro subscription (#INV-2026-894)',
    previewText: 'Thank you for your payment of $29.00 USD. Invoice details attached.',
    thumbnail: '/templates/tmpl_15.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#0f172a',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      containerWidth: '560px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ MAILPILOT BILLING', badge: 'PAID RECEIPT', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Payment Received — Thank You!',
          subtitle: 'Here is your official receipt for invoice #INV-2026-894.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'AMOUNT PAID: $29.00 USD',
          title: 'MailPilot Pro Monthly Plan',
          text: 'Billed to card ending in •••• 4242 on March 26, 2026.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Download PDF Tax Invoice →', url: 'https://mailpilot.io/invoices/894', align: 'left', style: 'outline' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'MailPilot Inc. • 100 Market St, San Francisco CA 94105.',
          showUnsubscribe: false,
        },
      },
    ],
  },
  {
    id: 'trans-security',
    title: 'Security Alert: New Device Sign-In',
    category: 'transactional',
    subject: 'Security Alert: New sign-in to your MailPilot account from Chrome on macOS',
    previewText: 'If this was you, no action is required. If not, secure your account now.',
    thumbnail: '/templates/tmpl_16.svg',
    styles: {
      canvasBg: '#fff7ed',
      cardBg: '#ffffff',
      primaryColor: '#ea580c',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '10px',
      containerWidth: '540px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '🛡️ SECURITY ALERT', badge: 'NEW SIGN-IN', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'New sign-in detected',
          subtitle: 'We noticed a recent login to your account {{email}} from a new device.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: '**Sign-In Details:**\n- **Device:** Chrome on macOS Sonoma\n- **Location:** San Francisco, California, United States\n- **IP Address:** 198.51.100.42\n- **Time:** Just now',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'This Wasn\'t Me — Lock Account →', url: 'https://mailpilot.io/security/lock', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Automated security telemetry from MailPilot Authentication Service.',
          showUnsubscribe: false,
        },
      },
    ],
  },

  // ─── 7. FEEDBACK & NPS (2 Templates) ──────────────────────────────────────
  {
    id: 'feed-nps',
    title: '1-Click Customer NPS Rating Survey',
    category: 'feedback',
    subject: 'How likely are you to recommend {{workspace_name}}? (Quick 1-click survey)',
    previewText: 'Your feedback directly shapes our roadmap. Rate us from 1 to 10.',
    thumbnail: '/templates/tmpl_17.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#E8A33D',
      textColor: '#0f172a',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ FEEDBACK PULSE', badge: '1-CLICK SURVEY', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'How are we doing, {{first_name}}?',
          subtitle: 'How likely are you to recommend MailPilot to a colleague or founder friend?',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'nps_rating',
        content: {
          baseUrl: 'https://mailpilot.io/survey?score=',
          lowLabel: 'Not likely (0)',
          highLabel: 'Extremely likely (10)',
        },
      },
      {
        id: 'b4',
        type: 'text',
        content: {
          body: 'Clicking a number instantly registers your vote. Thank you for helping us improve!',
        },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Sent to active users of {{workspace_name}}.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'feed-interview',
    title: '15-Minute Product Roadmap Research Call',
    category: 'feedback',
    subject: 'Can we buy you a $25 coffee in exchange for 15 minutes of feedback?',
    previewText: 'We\'d love to learn about your current email workflow and biggest pain points.',
    thumbnail: '/templates/tmpl_18.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#0f172a',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '☕ RESEARCH INVITATION', badge: '15 MIN CALL', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Help shape our next major release',
          subtitle: 'Hi {{first_name}}, our product design team is researching how high-growth teams organize their email workflows.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: 'We are hosting short 15-minute Zoom chats over the next two weeks. To say thank you, we will send you a **$25 Amazon or Starbucks gift card** immediately following our chat.\n\nNo preparation needed — we just want to watch how you build campaigns.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Pick a Time on Calendar →', url: 'https://cal.com/mailpilot-research', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Slots are limited to 20 participants.',
          showUnsubscribe: true,
        },
      },
    ],
  },

  // ─── 8. WIN-BACK (3 Templates) ────────────────────────────────────────────
  {
    id: 'win-missyou',
    title: 'We Miss You: 30-Day Inactivity Check-in',
    category: 'reengagement',
    subject: 'Is everything okay, {{first_name}}? We noticed you\'ve been away',
    previewText: 'Here is what has changed since your last broadcast + a special return offer.',
    thumbnail: '/templates/tmpl_19.svg',
    styles: {
      canvasBg: '#fef3c7',
      cardBg: '#ffffff',
      primaryColor: '#d97706',
      textColor: '#1c1917',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ CHECK-IN', badge: 'WE MISS YOU', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'It\'s been a while, {{first_name}} 👋',
          subtitle: 'We noticed you haven\'t launched an email campaign in the past 30 days. Is there anything we can help you unblock?',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'New features you haven\'t tried yet:',
          items: [
            { icon: '✨', title: 'Canva-Style Editor', text: 'Visual drag-and-drop template builder.' },
            { icon: '🤖', title: 'AI Assistant', text: '1-click email copy generation.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Jump Back into Workspace →', url: 'https://mailpilot.io/dashboard', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'If you no longer wish to receive updates, you can unsubscribe below.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'win-recovery',
    title: 'Draft Campaign Recovery & 20% Discount',
    category: 'reengagement',
    subject: 'You left an unfinished campaign draft in MailPilot 📝',
    previewText: 'Your draft is saved and ready. Complete sending in just 2 clicks.',
    thumbnail: '/templates/tmpl_20.svg',
    styles: {
      canvasBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryColor: '#E8A33D',
      textColor: '#1e293b',
      fontFamily: 'sans-serif',
      borderRadius: '12px',
      containerWidth: '580px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ DRAFT RECOVERY', badge: 'AUTO-SAVED', align: 'left' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Your draft is waiting for you',
          subtitle: 'Hi {{first_name}}, we noticed you started drafting a broadcast campaign but didn\'t finish dispatching it.',
          align: 'left',
        },
      },
      {
        id: 'b3',
        type: 'announcement',
        content: {
          badge: 'SAVED DRAFT',
          title: 'Ready for 1-Click Launch',
          text: 'All your formatting, audience tags, and subject lines were preserved.',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Resume & Dispatch Draft →', url: 'https://mailpilot.io/campaigns', align: 'left', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Need help refining your copy? Try our AI Copy Studio in the editor.',
          showUnsubscribe: true,
        },
      },
    ],
  },
  {
    id: 'win-reengage',
    title: 'See What You Missed & Re-activate',
    category: 'reengagement',
    subject: '3 reasons to take another look at MailPilot this quarter',
    previewText: 'New deliverability engine, 99.8% inbox guarantees, and lower pricing.',
    thumbnail: '/templates/tmpl_19.svg',
    styles: {
      canvasBg: '#0f172a',
      cardBg: '#1e293b',
      primaryColor: '#38bdf8',
      textColor: '#f8fafc',
      fontFamily: 'sans-serif',
      borderRadius: '16px',
      containerWidth: '600px',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: { logoText: '⚡ WHAT\'S NEW', badge: 'RE-ENGAGE', align: 'center' },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'We\'ve rebuilt MailPilot from the ground up',
          subtitle: 'If it\'s been a while since your last send, here is why over 1,200 new SaaS companies switched to MailPilot this month.',
          align: 'center',
        },
      },
      {
        id: 'b3',
        type: 'feature_grid',
        content: {
          heading: 'Top 3 Upgrades:',
          items: [
            { icon: '⚡', title: '5x Faster Dispatch', text: 'Broadcast 100k emails in under 90 seconds.' },
            { icon: '🎨', title: 'Canva Template Studio', text: 'Zero code needed to design emails.' },
            { icon: '💰', title: '70% Lower Cost', text: 'No seat fees or artificial subscriber limits.' },
          ],
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: { text: 'Reactivate Your Workspace Today →', url: 'https://mailpilot.io/dashboard', align: 'center', style: 'primary' },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          note: 'Your account data and subscriber audience remain securely stored.',
          showUnsubscribe: true,
        },
      },
    ],
  },
];

export default STARTER_TEMPLATES;
