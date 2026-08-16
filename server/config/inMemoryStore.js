// In-Memory Database Store for MailPilot
// High-fidelity fallback store when running in local development or test mode without PostgreSQL
// Mirrors Prisma Client API with full workspace isolation, relations, and atomic state.

const bcrypt = require('bcryptjs');

class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    // Generate bcrypt hash for default admin password "password123"
    // $2a$12$NqL.YxU62hUfO7v2N.s2j.wO0pZ6g0vM2B9uY9C8uF8yZ6g0vM2B9
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    const defaultUserId = 'usr_admin_01';
    const defaultWorkspaceId = 'ws_default_01';

    this.users = [
      {
        id: defaultUserId,
        name: 'Demo Admin',
        email: 'admin@mailpilot.io',
        passwordHash: defaultPasswordHash,
        emailVerified: new Date(),
        image: null,
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.accounts = [];
    this.sessions = [];

    this.workspaces = [
      {
        id: defaultWorkspaceId,
        name: "Admin's Workspace",
        slug: 'ws-admin-default',
        logo: null,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.workspaceMemberships = [
      {
        id: 'wsm_01',
        userId: defaultUserId,
        workspaceId: defaultWorkspaceId,
        role: 'ADMIN',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.contacts = [
      {
        id: 'cnt_01',
        workspaceId: defaultWorkspaceId,
        email: 'alex@example.com',
        name: 'Alex Morgan',
        tags: ['Product', 'VIP'],
        subscribed: true,
        source: 'manual',
        engagement: { opens: 4, clicks: 2 },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'cnt_02',
        workspaceId: defaultWorkspaceId,
        email: 'sarah@startup.io',
        name: 'Sarah Chen',
        tags: ['Engineering', 'Beta'],
        subscribed: true,
        source: 'manual',
        engagement: { opens: 3, clicks: 1 },
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'cnt_03',
        workspaceId: defaultWorkspaceId,
        email: 'dev@techpulse.org',
        name: 'David Evans',
        tags: ['Newsletter'],
        subscribed: true,
        source: 'csv_import',
        engagement: { opens: 2, clicks: 0 },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'cnt_04',
        workspaceId: defaultWorkspaceId,
        email: 'emma@growthlabs.co',
        name: 'Emma Watson',
        tags: ['VIP', 'Growth'],
        subscribed: true,
        source: 'manual',
        engagement: { opens: 5, clicks: 3 },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'cnt_05',
        workspaceId: defaultWorkspaceId,
        email: 'marcus@cloudstack.net',
        name: 'Marcus Vance',
        tags: ['Founder'],
        subscribed: true,
        source: 'manual',
        engagement: { opens: 1, clicks: 0 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.templates = [
      {
        id: 'tmpl_01',
        workspaceId: defaultWorkspaceId,
        title: 'Welcome & 3-Step Quickstart Journey',
        subject: 'Welcome to MailPilot, {{first_name}} — Let\'s get you set up 🚀',
        body: 'Hello {{first_name}},\n\nWelcome to MailPilot! We are thrilled to have you on board. Here is a quick 3-step guide to get your first campaign live in under 5 minutes.\n\n1. Import your subscriber contacts\n2. Customize an email template\n3. Launch and track opens live\n\nVisit your dashboard now: https://mailpilot.io/dashboard',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<div style="margin-bottom: 24px;"><span style="background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; font-family: monospace;">QUICK START GUIDE</span></div>' +
          '<h2 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 16px; letter-spacing: -0.02em;">Welcome to MailPilot, {{first_name}}! 🚀</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">We built MailPilot to give high-growth SaaS teams enterprise-grade email deliverability and real-time tracking with zero complexity.</p>' +
          '<div style="background: #f8fafc; border-left: 4px solid #E8A33D; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">' +
          '<h4 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a;">3 Quick Steps to Launch:</h4>' +
          '<ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #334155;">' +
          '<li><strong>Import your subscribers</strong> via CSV or manual audience entry.</li>' +
          '<li><strong>Select or customize an email template</strong> from our gallery.</li>' +
          '<li><strong>Send or schedule</strong> and watch real-time opens & clicks roll in.</li>' +
          '</ol></div>' +
          '<div style="margin: 28px 0;"><a href="https://mailpilot.io/campaigns" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Launch First Campaign &rarr;</a></div>' +
          '<p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">Have questions? Reply directly to this email or visit our help center.</p>' +
          '</div>',
        category: 'onboarding',
        usageCount: 24,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_02',
        workspaceId: defaultWorkspaceId,
        title: 'Magic Link & Account Verification',
        subject: 'Verify your email address for {{workspace_name}}',
        body: 'Hello {{first_name}},\n\nPlease click the button below or enter verification code 849-201 to verify your workspace access.\n\nVerify: https://mailpilot.io/verify?token=example_token\n\nThis link will expire in 30 minutes.',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">' +
          '<div style="width: 48px; height: 48px; background: #E8A33D; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px;">⚡</div>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-bottom: 12px;">Verify your workspace email</h2>' +
          '<p style="font-size: 15px; color: #475569; margin-bottom: 24px;">Hi {{first_name}}, please confirm your email address to activate your MailPilot account.</p>' +
          '<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a; margin-bottom: 24px;">849-201</div>' +
          '<a href="https://mailpilot.io/verify" style="background: #0f172a; color: #ffffff; font-weight: 600; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Confirm & Access Workspace &rarr;</a>' +
          '<p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you did not request this verification, you can safely ignore this message.</p>' +
          '</div>',
        category: 'onboarding',
        usageCount: 19,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_03',
        workspaceId: defaultWorkspaceId,
        title: 'Founder Personal Welcome Note',
        subject: 'Quick note from the founder: Welcome to MailPilot!',
        body: 'Hey {{first_name}},\n\nI saw you just signed up for MailPilot and wanted to personally welcome you to our community.\n\nWhy did you decide to try MailPilot today? Just hit reply and let me know — I read and answer every email personally.\n\nBest,\nAlex Morgan\nFounder, MailPilot',
        htmlBody: '<div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; color: #2d3748; line-height: 1.8; font-size: 16px;">' +
          '<p>Hey {{first_name}},</p>' +
          '<p>I noticed you just signed up for MailPilot, and I wanted to personally reach out and welcome you.</p>' +
          '<p>We started MailPilot because we were tired of legacy email tools that charged exorbitant fees while hiding basic deliverability and tracking features behind enterprise paywalls.</p>' +
          '<p><strong>Quick question for you:</strong> What is the single biggest goal you want to achieve with your email campaigns this month?</p>' +
          '<p>Just hit reply to this email and let me know — I read every response personally and would love to help you dial in your deliverability.</p>' +
          '<p style="margin-top: 28px;">Best,<br><strong>Alex Morgan</strong><br><span style="font-size: 13px; color: #718096; font-family: sans-serif;">Founder & CEO, MailPilot</span></p>' +
          '</div>',
        category: 'onboarding',
        usageCount: 15,
        createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_04',
        workspaceId: defaultWorkspaceId,
        title: 'Monthly Product Changelog & Release Notes',
        subject: 'What\'s new in MailPilot — Issue #14 ⚡',
        body: 'Hello {{first_name}},\n\nHere is our latest monthly product release notes featuring major speed upgrades and AI optimizations.\n\n- Real-Time Open Tracking\n- AI Subject Line Copilot\n- RFC 8058 Compliance\n\nRead more: https://mailpilot.io/changelog',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; font-family: monospace;">PRODUCT UPDATE &bull; ISSUE #14</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 14px; margin-bottom: 16px;">What\'s New in MailPilot 2.0 ⚡</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hello {{first_name}}, check out this month\'s latest improvements and performance upgrades:</p>' +
          '<ul style="font-size: 14px; line-height: 1.8; color: #334155; padding-left: 20px;">' +
          '<li><strong>Real-Time Open Tracking:</strong> Pixel analytics updated with sub-second accuracy.</li>' +
          '<li><strong>AI Subject Line Copilot:</strong> Generate 5 conversion-optimized variations in 1 click.</li>' +
          '<li><strong>One-Click Unsubscribe:</strong> Full RFC 8058 deliverability compliance.</li>' +
          '<li><strong>Sub-second Background Scheduler:</strong> Automated drip dispatch pipeline.</li>' +
          '</ul>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/changelog" style="background: #3E6B70; color: #ffffff; font-weight: bold; padding: 10px 22px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px;">Read Full Changelog &rarr;</a></div>' +
          '</div>',
        category: 'product',
        usageCount: 18,
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_05',
        workspaceId: defaultWorkspaceId,
        title: 'Major Feature Unveil: AI Copy Studio',
        subject: 'Introducing AI Copy Studio: 10x faster email drafting 🤖',
        body: 'Hello {{first_name}},\n\nWriting high-converting email copy just got effortless. Meet MailPilot AI Copy Studio — create tailored subject lines and full email copy in seconds.\n\nTry it now: https://mailpilot.io/ai-workspace',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">' +
          '<span style="background: #E8A33D; color: #14171C; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-family: monospace;">NEW FEATURE RELEASE</span>' +
          '<h2 style="font-size: 22px; font-weight: bold; margin: 12px 0 8px 0;">MailPilot AI Copy Studio is Live 🤖</h2>' +
          '<p style="font-size: 14px; color: #94a3b8; margin: 0;">Generate high-converting subject lines, preheaders, and email layouts in seconds.</p>' +
          '</div>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, say goodbye to writer\'s block. With our new AI engine, you can:</p>' +
          '<ul style="font-size: 14px; line-height: 1.8; color: #334155; padding-left: 20px;">' +
          '<li>Audit spam trigger words with real-time heuristic scanning.</li>' +
          '<li>Generate 5 subject lines ranked by predicted open rate score.</li>' +
          '<li>Draft personalized promotional, onboarding, and survey sequences.</li>' +
          '</ul>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/ai-workspace" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Try AI Copy Studio Free &rarr;</a></div>' +
          '</div>',
        category: 'product',
        usageCount: 14,
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_06',
        workspaceId: defaultWorkspaceId,
        title: 'System Maintenance & Service Advisory',
        subject: '[Notice] Scheduled Database Maintenance Window on Sunday',
        body: 'Hello {{first_name}},\n\nWe will be conducting scheduled infrastructure optimizations this Sunday between 02:00 UTC and 03:00 UTC.\n\nExpected impact: Zero email queue delays. Scheduled broadcasts will continue running.\n\nStatus page: https://status.mailpilot.io',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">' +
          '<span style="background: #fef3c7; color: #d97706; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">SCHEDULED MAINTENANCE</span>' +
          '</div>' +
          '<h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 12px;">Database Infrastructure Upgrade</h2>' +
          '<p style="font-size: 14px; line-height: 1.6; color: #475569;">Hi {{first_name}}, we are upgrading our database clusters to enhance delivery speeds and open tracking latency.</p>' +
          '<div style="background: #f8fafc; padding: 14px; border-radius: 6px; font-size: 13px; color: #334155; margin: 20px 0; border: 1px solid #e2e8f0;">' +
          '<strong>Window:</strong> Sunday, Aug 20 &bull; 02:00 &ndash; 03:00 UTC<br>' +
          '<strong>Impact:</strong> Dashboard analytics might experience a 5-minute sync delay. All outgoing emails will dispatch normally.' +
          '</div>' +
          '<p style="font-size: 13px; color: #64748b;">Follow real-time status updates at <a href="https://status.mailpilot.io" style="color: #E8A33D;">status.mailpilot.io</a>.</p>' +
          '</div>',
        category: 'product',
        usageCount: 7,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_07',
        workspaceId: defaultWorkspaceId,
        title: 'Live Masterclass: Deliverability Secrets',
        subject: 'Live Masterclass: How top SaaS scale to 99.4% inbox placement',
        body: 'Hello {{first_name}},\n\nJoin our upcoming live product masterclass this Thursday to learn how top tech companies reach 99.4% deliverability rates without getting flagged in spam.\n\nRegister now: https://mailpilot.io/webinar',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-bottom: 14px;">Special Masterclass: Maximizing Email Deliverability 📡</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, discover how high-growth SaaS teams reach 99.4% inbox placement rates with DKIM, SPF alignment, and smart warming.</p>' +
          '<div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">' +
          '<p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>📅 Date:</strong> Thursday, 2:00 PM EST<br><strong>⏱ Duration:</strong> 45 minutes + Live Q&A<br><strong>🎤 Host:</strong> MailPilot Deliverability Lab</p>' +
          '</div>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/webinar" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Reserve Your Free Seat &rarr;</a></div>' +
          '</div>',
        category: 'announcement',
        usageCount: 16,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_08',
        workspaceId: defaultWorkspaceId,
        title: 'Annual User Conference & Keynote Invitation',
        subject: 'You\'re invited: MailPilot Summit 2026 🎪',
        body: 'Hello {{first_name}},\n\nWe are hosting MailPilot Summit 2026 — an annual gathering of growth marketers, founders, and deliverability experts.\n\nEarly-bird tickets are now live. Reserve yours: https://mailpilot.io/summit',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-family: monospace;">ANNUAL SUMMIT &bull; VIRTUAL & IN-PERSON</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 14px; margin-bottom: 12px;">MailPilot Summit 2026 is Here 🎪</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, join over 2,500 founders and growth leaders for 2 days of keynotes, teardowns, and actionable workshops.</p>' +
          '<ul style="font-size: 14px; line-height: 1.8; color: #334155; padding-left: 20px;">' +
          '<li>Keynote: The Future of AI in SaaS Marketing</li>' +
          '<li>Deliverability Masterclass with ISP Postmasters</li>' +
          '<li>Hands-on Automated Drip Sequence Architecture</li>' +
          '</ul>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/summit" style="background: #3E6B70; color: #ffffff; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Claim Early Bird Pass &rarr;</a></div>' +
          '</div>',
        category: 'announcement',
        usageCount: 11,
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_09',
        workspaceId: defaultWorkspaceId,
        title: 'Milestone Celebration & User Thank You Credits',
        subject: 'We just crossed 10M emails sent! Here\'s a gift for you 🎁',
        body: 'Hello {{first_name}},\n\nThanks to incredible teams like {{workspace_name}}, MailPilot has officially delivered over 10,000,000 emails!\n\nAs a thank you, use coupon code PILOT10M for $50 in sending credits.\n\nClaim: https://mailpilot.io/settings',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">' +
          '<div style="font-size: 40px; margin-bottom: 12px;">🎉</div>' +
          '<h2 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 12px;">10 Million Emails Delivered!</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">We couldn\'t have reached this milestone without {{workspace_name}}. To celebrate, here is $50 in platform credits for your next broadcast.</p>' +
          '<div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 2px dashed #E8A33D; display: inline-block; margin: 20px 0;">' +
          '<span style="font-size: 12px; color: #64748b; font-family: monospace;">YOUR CELEBRATION CODE:</span><br>' +
          '<strong style="font-size: 22px; color: #0f172a; letter-spacing: 3px;">PILOT10M</strong>' +
          '</div><br>' +
          '<a href="https://mailpilot.io/settings" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 26px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Apply $50 Credits &rarr;</a>' +
          '</div>',
        category: 'announcement',
        usageCount: 13,
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_10',
        workspaceId: defaultWorkspaceId,
        title: 'Weekly Founder Newsletter Digest',
        subject: 'The SaaS Growth Letter: 3 lessons scaling to $50k MRR',
        body: 'Hello {{first_name}},\n\nHere are 3 essential insights on customer retention and onboarding workflows from this week.\n\n1. Time-triggered sequences beat bulk blasts\n2. Keep your unsubscribe 1-click simple\n3. Warm up new domains gradually\n\nRead more: https://mailpilot.io/newsletter/issue-48',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="font-size: 12px; color: #64748b; font-family: monospace; text-transform: uppercase;">Issue #48 &bull; Weekly Digest</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 8px; margin-bottom: 16px;">3 Lessons Scaling to $50k MRR 💡</h2>' +
          '<p style="font-size: 15px; line-height: 1.7; color: #475569;">Hey {{first_name}}, the single biggest lever in B2B SaaS retention is sending automated time-triggered sequences when users hit milestones.</p>' +
          '<blockquote style="border-left: 3px solid #E8A33D; padding-left: 14px; margin: 18px 0; color: #334155; font-style: italic; font-size: 14px;">"Action-oriented emails get 3x higher click-through rates than generic marketing blasts."</blockquote>' +
          '<p style="font-size: 14px; color: #475569;">Best,<br><strong>The MailPilot Editorial Team</strong></p>' +
          '</div>',
        category: 'newsletter',
        usageCount: 22,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_11',
        workspaceId: defaultWorkspaceId,
        title: '2026 Email Deliverability Benchmark Report',
        subject: 'New Report: 2026 Email Marketing Benchmarks for B2B SaaS 📊',
        body: 'Hello {{first_name}},\n\nWe analyzed over 25 million emails sent in Q1 2026 to reveal the industry benchmarks for open rates, bounce rates, and click-through conversions.\n\nDownload the full 24-page report: https://mailpilot.io/benchmarks-2026',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; font-family: monospace;">INDUSTRY REPORT &bull; FREE PDF</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 12px; margin-bottom: 14px;">2026 B2B Email Deliverability Benchmarks 📊</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, see how your campaigns stack up against 1,200+ high-growth SaaS companies.</p>' +
          '<div style="display: flex; gap: 12px; margin: 20px 0;">' +
          '<div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;"><div style="font-size: 20px; font-weight: bold; color: #E8A33D;">38.4%</div><div style="font-size: 12px; color: #64748b;">Avg Open Rate</div></div>' +
          '<div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;"><div style="font-size: 20px; font-weight: bold; color: #22C55E;">14.2%</div><div style="font-size: 12px; color: #64748b;">Click-to-Open</div></div>' +
          '<div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;"><div style="font-size: 20px; font-weight: bold; color: #3E6B70;">0.3%</div><div style="font-size: 12px; color: #64748b;">Bounce Ceiling</div></div>' +
          '</div>' +
          '<a href="https://mailpilot.io/benchmarks-2026" style="background: #0f172a; color: #ffffff; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Download 24-Page PDF Report &rarr;</a>' +
          '</div>',
        category: 'newsletter',
        usageCount: 17,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_12',
        workspaceId: defaultWorkspaceId,
        title: 'Trial Expiration & 48-Hour Warning',
        subject: 'Your MailPilot Pro trial expires in 48 hours, {{first_name}}',
        body: 'Hello {{first_name}},\n\nYour 14-day trial of MailPilot Pro is ending soon. Upgrade today with coupon code PILOT20 for 20% off your first year.\n\nUpgrade: https://mailpilot.io/settings',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; font-family: monospace;">LIMITED OFFER &bull; 48 HOURS LEFT</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 12px; margin-bottom: 14px;">Keep Your Pro Delivery Speed Active ⚡</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, don\'t lose access to unlimited subscribers and automated sequences. Upgrade today and save 20% on the Scale & Growth plan.</p>' +
          '<div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1; text-align: center;">' +
          '<span style="font-size: 12px; color: #64748b;">Use coupon code at checkout:</span><br>' +
          '<strong style="font-size: 20px; color: #0f172a; letter-spacing: 2px;">PILOT20</strong>' +
          '</div>' +
          '<div style="margin: 20px 0;"><a href="https://mailpilot.io/settings" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Claim 20% Discount &rarr;</a></div>' +
          '</div>',
        category: 'promotional',
        usageCount: 26,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_13',
        workspaceId: defaultWorkspaceId,
        title: 'Black Friday & Cyber Week 50% Off Annual',
        subject: '⚡ Black Friday: Get 50% off MailPilot Annual Plans',
        body: 'Hello {{first_name}},\n\nOur biggest sale of the year is live! Get 50% off any annual MailPilot plan for the next 72 hours only.\n\nClaim Black Friday Deal: https://mailpilot.io/black-friday',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">' +
          '<div style="text-align: center;">' +
          '<span style="background: #E8A33D; color: #14171C; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-family: monospace;">CYBER WEEK SPECIAL</span>' +
          '<h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 16px 0 10px 0;">50% OFF ANNUAL PLANS ⚡</h1>' +
          '<p style="color: #94a3b8; font-size: 15px; max-width: 440px; margin: 0 auto 24px auto;">Supercharge your email deliverability, AI copy generation, and analytics for half the price.</p>' +
          '<a href="https://mailpilot.io/black-friday" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 15px;">Claim 50% Off Annual &rarr;</a>' +
          '<p style="color: #64748b; font-size: 12px; margin-top: 20px;">Offer strictly valid for the next 72 hours only.</p>' +
          '</div></div>',
        category: 'promotional',
        usageCount: 31,
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_14',
        workspaceId: defaultWorkspaceId,
        title: 'Enterprise Plan & High-Volume Upgrade',
        subject: 'Scale your sending limits with MailPilot Enterprise 🏢',
        body: 'Hello {{first_name}},\n\nSending more than 100k emails per month? MailPilot Enterprise gives you dedicated IP pools, custom DKIM concierge setup, and SLA uptime guarantees.\n\nSchedule consultation: https://mailpilot.io/enterprise',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #f1f5f9; color: #0f172a; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-family: monospace;">ENTERPRISE DELIVERY</span>' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 12px; margin-bottom: 14px;">Dedicated IP Pools & High-Volume Sending 🏢</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, as your subscriber audience grows past 50,000, dedicated sending architecture ensures zero cross-tenant reputation risks.</p>' +
          '<ul style="font-size: 14px; line-height: 1.8; color: #334155; padding-left: 20px;">' +
          '<li>Dedicated IP pools warmed and managed by our engineering team.</li>' +
          '<li>Custom DMARC, BIMI logo integration, and feedback loop setup.</li>' +
          '<li>99.99% Uptime SLA and priority 24/7 Slack support.</li>' +
          '</ul>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/enterprise" style="background: #0f172a; color: #ffffff; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Schedule Architecture Review &rarr;</a></div>' +
          '</div>',
        category: 'promotional',
        usageCount: 8,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_15',
        workspaceId: defaultWorkspaceId,
        title: 'Monthly Subscription Invoice & Payment Receipt',
        subject: 'Your MailPilot Invoice & Receipt #INV-2026-0814',
        body: 'Hello {{first_name}},\n\nThank you for your payment. Here is the receipt for your recent subscription payment of $49.00 for {{workspace_name}}.\n\nDownload PDF: https://mailpilot.io/invoices/INV-2026-0814.pdf',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">' +
          '<div><strong style="font-size: 18px; color: #0f172a;">⚡ MailPilot</strong></div>' +
          '<div style="font-size: 12px; color: #64748b; font-family: monospace;">RECEIPT #INV-2026-0814</div>' +
          '</div>' +
          '<p style="font-size: 14px; color: #475569;">Hi {{first_name}}, thanks for your continued support! Your payment has been processed successfully.</p>' +
          '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">' +
          '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; color: #64748b;">Plan</td><td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0f172a;">Scale & Growth Plan (Monthly)</td></tr>' +
          '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; color: #64748b;">Workspace</td><td style="padding: 10px 0; text-align: right; color: #0f172a;">{{workspace_name}}</td></tr>' +
          '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; color: #64748b;">Payment Method</td><td style="padding: 10px 0; text-align: right; font-family: monospace; color: #0f172a;">Visa &bull;&bull;&bull;&bull; 4242</td></tr>' +
          '<tr><td style="padding: 12px 0; font-weight: bold; color: #0f172a; font-size: 16px;">Total Paid</td><td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0f172a; font-size: 16px;">$49.00 USD</td></tr>' +
          '</table>' +
          '<a href="https://mailpilot.io/settings" style="font-size: 13px; color: #E8A33D; text-decoration: none; font-weight: bold;">View billing history & download PDF invoice &rarr;</a>' +
          '</div>',
        category: 'transactional',
        usageCount: 35,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_16',
        workspaceId: defaultWorkspaceId,
        title: 'Security Alert: New Device Login',
        subject: 'Security Alert: New sign-in detected on your account',
        body: 'Hello {{first_name}},\n\nA new sign-in was detected on your MailPilot account.\n\nDevice: Chrome on macOS\nIP: 198.51.100.44\nTime: Just now\n\nIf this was you, no action is needed. If not, please reset your password immediately: https://mailpilot.io/forgot-password',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<div style="width: 44px; height: 44px; background: #fee2e2; color: #dc2626; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px;">🛡️</div>' +
          '<h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 12px;">New login to your MailPilot account</h2>' +
          '<p style="font-size: 14px; color: #475569;">Hi {{first_name}}, we noticed a login from an unrecognized browser or location.</p>' +
          '<div style="background: #f8fafc; padding: 14px; border-radius: 8px; font-size: 13px; color: #334155; margin: 18px 0; border: 1px solid #e2e8f0; font-family: monospace;">' +
          'Device: Chrome on macOS<br>Location: San Francisco, CA (US)<br>IP: 198.51.100.44<br>Timestamp: ' + new Date().toUTCString() +
          '</div>' +
          '<a href="https://mailpilot.io/forgot-password" style="background: #dc2626; color: #ffffff; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 13px;">Secure My Account &rarr;</a>' +
          '</div>',
        category: 'transactional',
        usageCount: 12,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_17',
        workspaceId: defaultWorkspaceId,
        title: 'Customer NPS & Satisfaction Survey',
        subject: 'Quick question about your experience with MailPilot, {{first_name}}? 💬',
        body: 'Hello {{first_name}},\n\nHow likely are you to recommend MailPilot to a friend or colleague? Click a rating from 1 (unlikely) to 10 (extremely likely).\n\nRate now: https://mailpilot.io/feedback',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-bottom: 12px;">How is MailPilot working for you? 💬</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569; max-width: 480px; margin: 0 auto 24px auto;">Hi {{first_name}}, how likely are you to recommend MailPilot to a fellow founder or marketer?</p>' +
          '<div style="display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">' +
          '<a href="https://mailpilot.io/feedback?score=1" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #fee2e2; color: #991b1b; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">1</a>' +
          '<a href="https://mailpilot.io/feedback?score=3" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #fee2e2; color: #991b1b; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">3</a>' +
          '<a href="https://mailpilot.io/feedback?score=5" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #fef3c7; color: #92400e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">5</a>' +
          '<a href="https://mailpilot.io/feedback?score=7" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #334155; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">7</a>' +
          '<a href="https://mailpilot.io/feedback?score=9" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #dcfce7; color: #166534; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">9</a>' +
          '<a href="https://mailpilot.io/feedback?score=10" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #22c55e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">10</a>' +
          '</div>' +
          '<p style="font-size: 12px; color: #94a3b8;">1 = Not likely at all &bull; 10 = Extremely likely</p>' +
          '</div>',
        category: 'feedback',
        usageCount: 21,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_18',
        workspaceId: defaultWorkspaceId,
        title: 'Product Roadmap & Feature Request Call',
        subject: 'Help us build the future of MailPilot (15-min chat + $50 gift card)',
        body: 'Hello {{first_name}},\n\nOur product design team is conducting 15-minute research calls with active users this week. We would love to get your thoughts on upcoming workflow automations.\n\nBook 15 mins: https://calendly.com/mailpilot-team/feedback',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 12px;">We\'d love your feedback, {{first_name}} 💡</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Our engineering team is currently designing our next-generation drip workflow builder, and we want to ensure it solves your exact day-to-day pain points.</p>' +
          '<p style="font-size: 14px; line-height: 1.6; color: #334155;">If you have 15 minutes to chat this week, we will send over a <strong>$50 Amazon or Stripe credit</strong> as a token of our appreciation.</p>' +
          '<div style="margin: 24px 0;"><a href="https://calendly.com/mailpilot-team" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Pick a 15-Minute Slot &rarr;</a></div>' +
          '</div>',
        category: 'feedback',
        usageCount: 9,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_19',
        workspaceId: defaultWorkspaceId,
        title: 'We Miss You / 30-Day Inactivity Win-Back',
        subject: 'We miss you, {{first_name}} — Here is what\'s new in MailPilot',
        body: 'Hello {{first_name}},\n\nIt has been a few weeks since your last broadcast. We\'ve added automated AI subject generation, live open tracking, and new templates to help your campaigns succeed.\n\nLog in now: https://mailpilot.io',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-bottom: 12px;">It\'s been a while, {{first_name}} 👋</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Your audience in {{workspace_name}} is waiting for your next update. Here are a few features we recently launched to make broadcasting easier than ever:</p>' +
          '<ul style="font-size: 14px; line-height: 1.8; color: #334155; padding-left: 20px;">' +
          '<li><strong>AI Subject Line Copilot:</strong> Generate click-worthy subjects in 1 click.</li>' +
          '<li><strong>Live Engagement Graph:</strong> Watch opens and clicks occur in real-time.</li>' +
          '<li><strong>20+ Ready-to-Use Templates:</strong> Newsletters, product launches, and surveys.</li>' +
          '</ul>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/campaigns" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Resume Campaign Creation &rarr;</a></div>' +
          '</div>',
        category: 'reengagement',
        usageCount: 14,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'tmpl_20',
        workspaceId: defaultWorkspaceId,
        title: 'Abandoned Broadcast / Campaign Draft Recovery',
        subject: 'You left a broadcast unfinished in {{workspace_name}} ✍️',
        body: 'Hello {{first_name}},\n\nYour campaign draft is saved and waiting in {{workspace_name}}. Finish and dispatch it in just one click.\n\nResume draft: https://mailpilot.io/campaigns',
        htmlBody: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">' +
          '<span style="background: #fef3c7; color: #d97706; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-family: monospace;">SAVED DRAFT REMINDER</span>' +
          '<h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-top: 12px; margin-bottom: 12px;">Your email broadcast is ready to launch ✍️</h2>' +
          '<p style="font-size: 15px; line-height: 1.6; color: #475569;">Hi {{first_name}}, you started drafting a campaign in {{workspace_name}} recently. We saved all your changes so you can pick right up where you left off.</p>' +
          '<div style="margin: 24px 0;"><a href="https://mailpilot.io/campaigns" style="background: #E8A33D; color: #14171C; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">Review & Send Broadcast &rarr;</a></div>' +
          '<p style="font-size: 12px; color: #94a3b8;">Need help with deliverability or spam checking? Our AI assistant is active in your dashboard.</p>' +
          '</div>',
        category: 'reengagement',
        usageCount: 16,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.templates = this.templates.map((t) => ({
      ...t,
      thumbnail: t.thumbnail || `/templates/${t.id}.svg`,
    }));

    this.campaigns = [
      {
        id: 'cmp_01',
        workspaceId: defaultWorkspaceId,
        name: 'Q3 Product Release Broadcast',
        subject: 'Introducing MailPilot 2.0 Telemetry Engine ⚡',
        previewText: 'High-deliverability email marketing for fast-growing SaaS',
        content: '<p>Hello {{first_name}},</p><p>We are thrilled to unveil MailPilot 2.0! Enjoy real-time telemetry and open pixel tracking.</p><p><a href="https://mailpilot.io">Explore MailPilot 2.0 &rarr;</a></p>',
        templateId: 'tmpl_01',
        audienceList: 'All Contacts',
        status: 'SENT',
        scheduledAt: null,
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        stats: { sent: 5, delivered: 5, opened: 4, clicked: 3, bounced: 0, unsubscribed: 0 },
        aiScore: 94,
        tags: ['Announcement', 'Q3'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'cmp_02',
        workspaceId: defaultWorkspaceId,
        name: 'Founder Welcome Drip',
        subject: 'Welcome to MailPilot — Getting Started',
        previewText: 'Quickstart guide for sending your first broadcast',
        content: '<p>Hello {{first_name}},</p><p>Thank you for joining. Here is how to configure your sender domain and audience.</p>',
        templateId: 'tmpl_02',
        audienceList: 'All Contacts',
        status: 'SENT',
        scheduledAt: null,
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        stats: { sent: 5, delivered: 5, opened: 3, clicked: 2, bounced: 0, unsubscribed: 0 },
        aiScore: 91,
        tags: ['Onboarding'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    this.notifications = [
      {
        id: 'notif_01',
        workspaceId: defaultWorkspaceId,
        type: 'campaign_sent',
        title: 'Campaign Broadcast Dispatched',
        message: 'Campaign "Q3 Product Release Broadcast" was dispatched to 5 subscribers.',
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'notif_02',
        workspaceId: defaultWorkspaceId,
        type: 'system',
        title: 'Workspace Initialized',
        message: 'MailPilot telemetry engine connected successfully.',
        read: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    // Seed email events across the last 7 days for realistic analytics telemetry
    this.emailEvents = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const eventDate = new Date(now - dayOffset * dayMs);
      const sentCount = 4 + (dayOffset % 3);
      const openCount = Math.max(1, Math.round(sentCount * 0.7));
      const clickCount = Math.max(0, Math.round(openCount * 0.6));

      for (let s = 0; s < sentCount; s++) {
        this.emailEvents.push({
          id: `evt_s_${dayOffset}_${s}`,
          workspaceId: defaultWorkspaceId,
          campaignId: 'cmp_01',
          contactId: `cnt_0${(s % 5) + 1}`,
          eventType: 'SENT',
          metadata: { provider: 'dev_mock' },
          createdAt: eventDate,
        });
      }

      for (let o = 0; o < openCount; o++) {
        this.emailEvents.push({
          id: `evt_o_${dayOffset}_${o}`,
          workspaceId: defaultWorkspaceId,
          campaignId: 'cmp_01',
          contactId: `cnt_0${(o % 5) + 1}`,
          eventType: 'OPENED',
          metadata: { ip: '127.0.0.1' },
          createdAt: new Date(eventDate.getTime() + 1000 * 60 * 15 * (o + 1)),
        });
      }

      for (let c = 0; c < clickCount; c++) {
        this.emailEvents.push({
          id: `evt_c_${dayOffset}_${c}`,
          workspaceId: defaultWorkspaceId,
          campaignId: 'cmp_01',
          contactId: `cnt_0${(c % 5) + 1}`,
          eventType: 'CLICKED',
          metadata: { url: 'https://mailpilot.io' },
          createdAt: new Date(eventDate.getTime() + 1000 * 60 * 30 * (c + 1)),
        });
      }
    }

    this.passwordResetTokens = [];
    this.subscriptions = [
      {
        id: 'sub_01',
        workspaceId: defaultWorkspaceId,
        plan: 'FREE',
        status: 'ACTIVE',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        monthlyEmailLimit: 1000,
        contactLimit: 500,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
  }

  // Model accessors returning Prisma-compatible query builders
  get user() {
    return this._createModelHandler(this.users, 'user');
  }

  get account() {
    return this._createModelHandler(this.accounts, 'account');
  }

  get session() {
    return this._createModelHandler(this.sessions, 'session');
  }

  get workspace() {
    return this._createModelHandler(this.workspaces, 'workspace');
  }

  get workspaceMembership() {
    return this._createModelHandler(this.workspaceMemberships, 'workspaceMembership');
  }

  get campaign() {
    return this._createModelHandler(this.campaigns, 'campaign');
  }

  get contact() {
    return this._createModelHandler(this.contacts, 'contact');
  }

  get template() {
    return this._createModelHandler(this.templates, 'template');
  }

  get notification() {
    return this._createModelHandler(this.notifications, 'notification');
  }

  get emailEvent() {
    return this._createModelHandler(this.emailEvents, 'emailEvent');
  }

  get passwordResetToken() {
    return this._createModelHandler(this.passwordResetTokens, 'passwordResetToken');
  }

  get subscription() {
    return this._createModelHandler(this.subscriptions, 'subscription');
  }

  _matchesWhere(item, where) {
    if (!where) return true;

    for (const [key, condition] of Object.entries(where)) {
      if (key === 'AND' && Array.isArray(condition)) {
        if (!condition.every((subWhere) => this._matchesWhere(item, subWhere))) return false;
        continue;
      }
      if (key === 'OR' && Array.isArray(condition)) {
        if (!condition.some((subWhere) => this._matchesWhere(item, subWhere))) return false;
        continue;
      }

      // Handle compound unique keys like workspaceId_email or provider_providerAccountId
      if (key === 'workspaceId_email' && typeof condition === 'object') {
        const itemEmail = (item.email || '').toLowerCase().trim();
        const condEmail = (condition.email || '').toLowerCase().trim();
        if (item.workspaceId !== condition.workspaceId || itemEmail !== condEmail) return false;
        continue;
      }
      if (key === 'provider_providerAccountId' && typeof condition === 'object') {
        if (item.provider !== condition.provider || item.providerAccountId !== condition.providerAccountId) return false;
        continue;
      }

      const val = item[key];

      if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
        if (condition.lte !== undefined) {
          if (val === null || val === undefined) return false;
          const target = new Date(condition.lte).getTime();
          const actual = new Date(val).getTime();
          if (isNaN(actual) || actual > target) return false;
        }
        if (condition.gte !== undefined) {
          if (val === null || val === undefined) return false;
          const target = new Date(condition.gte).getTime();
          const actual = new Date(val).getTime();
          if (isNaN(actual) || actual < target) return false;
        }
        if (condition.equals !== undefined && val !== condition.equals) return false;
        if (condition.not !== undefined && val === condition.not) return false;
        if (condition.in && Array.isArray(condition.in) && !condition.in.includes(val)) return false;
      } else {
        if (val !== condition) return false;
      }
    }
    return true;
  }

  _resolveIncludes(item, include, modelName) {
    if (!include || !item) return item;
    const result = { ...item };

    if (include.workspace && item.workspaceId) {
      result.workspace = this.workspaces.find((w) => w.id === item.workspaceId) || null;
    }
    if (include.user && item.userId) {
      result.user = this.users.find((u) => u.id === item.userId) || null;
    }
    if (include.emailEvents && modelName === 'campaign') {
      result.emailEvents = this.emailEvents
        .filter((e) => e.campaignId === item.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (include.memberships && modelName === 'workspace') {
      result.memberships = this.workspaceMemberships.filter((m) => m.workspaceId === item.id);
    }
    return result;
  }

  _applySelect(item, select) {
    if (!select || !item) return item;
    const res = {};
    for (const key of Object.keys(select)) {
      if (select[key]) {
        res[key] = item[key];
      }
    }
    return res;
  }

  _createModelHandler(collection, modelName) {
    const self = this;

    return {
      async findUnique(args = {}) {
        const item = collection.find((i) => self._matchesWhere(i, args.where));
        if (!item) return null;
        const resolved = self._resolveIncludes(item, args.include, modelName);
        return args.select ? self._applySelect(resolved, args.select) : resolved;
      },

      async findFirst(args = {}) {
        let items = collection.filter((i) => self._matchesWhere(i, args.where));
        if (args.orderBy) {
          const [field, order] = Object.entries(args.orderBy)[0];
          items.sort((a, b) => {
            if (order === 'desc') return (b[field] > a[field] ? 1 : -1);
            return (a[field] > b[field] ? 1 : -1);
          });
        }
        const item = items[0] || null;
        if (!item) return null;
        const resolved = self._resolveIncludes(item, args.include, modelName);
        return args.select ? self._applySelect(resolved, args.select) : resolved;
      },

      async findMany(args = {}) {
        let items = collection.filter((i) => self._matchesWhere(i, args.where));

        if (args.orderBy) {
          const [field, order] = Object.entries(args.orderBy)[0];
          items.sort((a, b) => {
            const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
            const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
            if (order === 'desc') return (valB > valA ? 1 : -1);
            return (valA > valB ? 1 : -1);
          });
        }

        if (args.take) {
          items = items.slice(0, args.take);
        }

        return items.map((i) => {
          const resolved = self._resolveIncludes(i, args.include, modelName);
          return args.select ? self._applySelect(resolved, args.select) : resolved;
        });
      },

      async create(args = {}) {
        const id = args.data.id || `${modelName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cleanedData = {};
        for (const [k, v] of Object.entries(args.data || {})) {
          if (v !== undefined) cleanedData[k] = v;
        }

        const newItem = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...cleanedData,
        };

        // Handle nested creation for workspace memberships
        if (args.data.memberships?.create) {
          const memberData = args.data.memberships.create;
          delete newItem.memberships;
          self.workspaceMemberships.push({
            id: `wsm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: memberData.userId,
            workspaceId: id,
            role: memberData.role || 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        collection.push(newItem);
        return self._resolveIncludes(newItem, args.include, modelName);
      },

      async update(args = {}) {
        const index = collection.findIndex((i) => self._matchesWhere(i, args.where));
        if (index === -1) {
          throw new Error(`Record to update not found in ${modelName}.`);
        }

        const cleanedData = {};
        for (const [k, v] of Object.entries(args.data || {})) {
          if (v !== undefined) cleanedData[k] = v;
        }

        const existing = collection[index];
        const updated = {
          ...existing,
          ...cleanedData,
          updatedAt: new Date(),
        };

        collection[index] = updated;
        return self._resolveIncludes(updated, args.include, modelName);
      },

      async updateMany(args = {}) {
        let count = 0;
        const cleanedData = {};
        for (const [k, v] of Object.entries(args.data || {})) {
          if (v !== undefined) cleanedData[k] = v;
        }

        for (let i = 0; i < collection.length; i++) {
          if (self._matchesWhere(collection[i], args.where)) {
            collection[i] = { ...collection[i], ...cleanedData, updatedAt: new Date() };
            count++;
          }
        }
        return { count };
      },

      async delete(args = {}) {
        const index = collection.findIndex((i) => self._matchesWhere(i, args.where));
        if (index === -1) {
          throw new Error(`Record to delete not found in ${modelName}.`);
        }
        const [deleted] = collection.splice(index, 1);
        return deleted;
      },

      async deleteMany(args = {}) {
        let count = 0;
        for (let i = collection.length - 1; i >= 0; i--) {
          if (self._matchesWhere(collection[i], args.where)) {
            collection.splice(i, 1);
            count++;
          }
        }
        return { count };
      },

      async count(args = {}) {
        return collection.filter((i) => self._matchesWhere(i, args.where)).length;
      },
    };
  }
}

const inMemoryStore = new InMemoryStore();
module.exports = { inMemoryStore };
