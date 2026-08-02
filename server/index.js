// MailPilot Backend API for email marketing & campaign automation
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5050;

// Enable JSON requests and CORS for local dev UI
app.use(cors());
app.use(bodyParser.json());

// In-memory counters for demo data
let campaignId = 1;
let contactId = 1;
let templateId = 1;

const campaigns = [
  { id: campaignId++, name: 'Welcome Drip', subject: 'Welcome to MailPilot SaaS', templateId: 1, list: 'All Contacts', status: 'draft', scheduledAt: null, sent: 0, opened: 0, clicked: 0, bounces: 0 },
  { id: campaignId++, name: 'Spring Offer', subject: 'Spring Discounts Inside', templateId: 2, list: 'All Contacts', status: 'scheduled', scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(), sent: 0, opened: 0, clicked: 0, bounces: 0 }
];

const templates = [
  { id: templateId++, title: 'Simple Welcome', body: 'Hi {{name}},\n\nWelcome to MailPilot. We are happy to have {{company}} onboard.' },
  { id: templateId++, title: 'Promo Highlight', body: 'Hello {{name}},\n\nOur best price for {{company}} is live now! Click to learn more.' }
];

const contacts = [
  { id: contactId++, name: 'Alice Chen', email: 'alice@example.com', tags: ['leads', 'trial'] },
  { id: contactId++, name: 'Brian Lee', email: 'brian@example.com', tags: ['customer', 'beta'] },
  { id: contactId++, name: 'Carla Smith', email: 'carla@example.com', tags: ['newsletter'] }
];

// Utility to compute a percentage safely
function safePct(n, total) { return total === 0 ? 0 : Math.round((n / total) * 100); }

// Summary endpoint for dashboard metrics
app.get('/api/summary', (req, res) => {
  const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const opens = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  const totalDelivered = totalEmailsSent - campaigns.reduce((sum, c) => sum + c.bounces, 0);
  res.json({
    totalCampaigns: campaigns.length,
    emailsSent: totalEmailsSent,
    openRate: safePct(opens, totalDelivered || 1),
    clickRate: safePct(clicks, totalDelivered || 1),
    contacts: contacts.length
  });
});

// Campaign CRUD endpoints
app.get('/api/campaigns', (req, res) => res.json(campaigns));
app.post('/api/campaigns', (req, res) => {
  const { name, subject, templateId, list, scheduledAt } = req.body;
  const newCampaign = { id: campaignId++, name, subject, templateId, list, status: scheduledAt ? 'scheduled' : 'draft', scheduledAt: scheduledAt || null, sent: 0, opened: 0, clicked: 0, bounces: 0 };
  campaigns.unshift(newCampaign);
  res.json(newCampaign);
});
app.put('/api/campaigns/:id', (req, res) => {
  const id = Number(req.params.id);
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  Object.assign(campaign, req.body);
  res.json(campaign);
});
app.delete('/api/campaigns/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Campaign not found' });
  campaigns.splice(idx, 1);
  res.json({ success: true });
});

// Send now endpoint simulating bulk send and tracking metrics
app.post('/api/campaigns/:id/send', (req, res) => {
  const id = Number(req.params.id);
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  const sendCount = contacts.length;
  campaign.sent += sendCount;
  campaign.opened += Math.floor(sendCount * 0.35 + Math.random() * 10);
  campaign.clicked += Math.floor(sendCount * 0.12 + Math.random() * 6);
  campaign.bounces += Math.floor(sendCount * 0.04);
  campaign.status = 'sent';
  campaign.scheduledAt = null;
  res.json(campaign);
});

// Email template management endpoints
app.get('/api/templates', (req, res) => res.json(templates));
app.post('/api/templates', (req, res) => {
  const { title, body } = req.body;
  const t = { id: templateId++, title, body };
  templates.unshift(t);
  res.json(t);
});

// Contact list manager endpoints
app.get('/api/contacts', (req, res) => res.json(contacts));
app.post('/api/contacts', (req, res) => {
  const { name, email, tags } = req.body;
  const c = { id: contactId++, name, email, tags: tags?.split(',').map(t => t.trim()).filter(Boolean) || [] };
  contacts.unshift(c);
  res.json(c);
});
app.delete('/api/contacts/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = contacts.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Contact not found' });
  contacts.splice(idx, 1);
  res.json({ success: true });
});

app.post('/api/contacts/import', (req, res) => {
  const { rows } = req.body;
  const imported = [];
  rows.forEach((r) => {
    if (!r.email) return;
    const c = { id: contactId++, name: r.name || r.email.split('@')[0], email: r.email, tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [] };
    contacts.unshift(c);
    imported.push(c);
  });
  res.json({ importedCount: imported.length, imported });
});

// Analytics endpoint returns rates and sample trend data
app.get('/api/analytics', (req, res) => {
  const openTotal = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const sentTotal = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const bounceTotal = campaigns.reduce((sum, c) => sum + c.bounces, 0);
  const clickTotal = campaigns.reduce((sum, c) => sum + c.clicked, 0);
  res.json({
    openRate: safePct(openTotal, sentTotal || 1),
    bounceRate: safePct(bounceTotal, sentTotal || 1),
    clickRate: safePct(clickTotal, sentTotal || 1),
    trend: [
      { day: 'Mon', sent: 20, opened: 8, clicked: 3 },
      { day: 'Tue', sent: 36, opened: 12, clicked: 5 },
      { day: 'Wed', sent: 50, opened: 16, clicked: 9 },
      { day: 'Thu', sent: 42, opened: 18, clicked: 6 },
      { day: 'Fri', sent: 58, opened: 24, clicked: 11 }
    ],
    perCampaign: campaigns.map(c => ({ id: c.id, name: c.name, sent: c.sent, opened: c.opened, clicked: c.clicked }))
  });
});

app.get('/api/status', (req, res) => res.json({ status: 'ok', service: 'MailPilot API' }));

app.listen(PORT, () => {
  console.log(`MailPilot API running on http://localhost:${PORT}`);
});
