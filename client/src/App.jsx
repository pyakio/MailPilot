import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Base API endpoint from backend server
const API = 'http://localhost:5050/api';

// Main navigation options for the app pages
const nav = ['Dashboard', 'Campaigns', 'Templates', 'Contacts', 'Analytics'];

// Utility used if card class logic grows later
function cardClass() {
  return 'card';
}

// Format date strings into local display
function fmtDate(dt) { return dt ? new Date(dt).toLocaleString() : '—'; }

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [summary, setSummary] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState({ trend: [], perCampaign: [] });
  const [campaignForm, setCampaignForm] = useState({ name: '', subject: '', templateId: '', list: 'All Contacts', scheduledAt: '' });
  const [templateForm, setTemplateForm] = useState({ title: '', body: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', tags: '' });
  const [csv, setCsv] = useState('name,email,tags\nJohn Doe,john@example.com,lead');
  const [selectedEdit, setSelectedEdit] = useState(null);

  // Load all backend data when app starts or refreshes
  const fetchAll = async () => {
    const [sum, cmp, tmpl, cts, anl] = await Promise.all([
      fetch(`${API}/summary`).then(r => r.json()),
      fetch(`${API}/campaigns`).then(r => r.json()),
      fetch(`${API}/templates`).then(r => r.json()),
      fetch(`${API}/contacts`).then(r => r.json()),
      fetch(`${API}/analytics`).then(r => r.json())
    ]);
    setSummary(sum); setCampaigns(cmp); setTemplates(tmpl); setContacts(cts); setAnalytics(anl);
  };

  useEffect(() => { fetchAll(); }, []);

  const campaignData = useMemo(() => analytics.perCampaign.map(c => ({ name: c.name, Sent: c.sent, Opened: c.opened, Clicked: c.clicked })), [analytics]);

  // Create a new campaign using the backend API
  const handleAddCampaign = async () => {
    const payload = { ...campaignForm, templateId: Number(campaignForm.templateId) || templates[0]?.id };
    await fetch(`${API}/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setCampaignForm({ name: '', subject: '', templateId: '', list: 'All Contacts', scheduledAt: '' });
    fetchAll();
  };

  const handleEditCampaign = (campaign) => {
    setSelectedEdit(campaign.id);
    setCampaignForm({ name: campaign.name, subject: campaign.subject, templateId: campaign.templateId, list: campaign.list, scheduledAt: campaign.scheduledAt || '' });
  };

  const handleUpdateCampaign = async () => {
    await fetch(`${API}/campaigns/${selectedEdit}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...campaignForm, templateId: Number(campaignForm.templateId) }) });
    setSelectedEdit(null);
    setCampaignForm({ name: '', subject: '', templateId: '', list: 'All Contacts', scheduledAt: '' });
    fetchAll();
  };

  const campaignIsValid = campaignForm.name && campaignForm.subject;

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brand">Cloud Email Marketing</div>
        <p className="muted">Student SaaS demo dashboard with email campaign automation.</p>
        <nav className="nav">
          {nav.map((n) => <button key={n} className={page === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>)}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div><h1>{page}</h1><p>Manage campaigns, templates, contacts, and analytics for your email marketing.</p></div>
        </header>

        {page === 'Dashboard' && (
          <>
            <section className="stats-grid">
              <div className="stat"><div>Total Campaigns</div><strong>{summary.totalCampaigns ?? 0}</strong></div>
              <div className="stat"><div>Emails Sent</div><strong>{summary.emailsSent ?? 0}</strong></div>
              <div className="stat"><div>Open Rate</div><strong>{summary.openRate ?? 0}%</strong></div>
              <div className="stat"><div>Click Rate</div><strong>{summary.clickRate ?? 0}%</strong></div>
            </section>
            <section className="grid2">
              <div className="card"><h3>Campaign Performance</h3><ResponsiveContainer width="100%" height={240}><LineChart data={campaignData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="Sent" stroke="#8884d8" /><Line type="monotone" dataKey="Opened" stroke="#82ca9d" /><Line type="monotone" dataKey="Clicked" stroke="#ff7300" /></LineChart></ResponsiveContainer></div>
              <div className="card"><h3>Email Open Trend</h3><ResponsiveContainer width="100%" height={240}><LineChart data={analytics.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="opened" stroke="#1f8eed" /></LineChart></ResponsiveContainer></div>
            </section>
          </>
        )}

        {page === 'Campaigns' && (
          <>
            <div className="card">
              <div className="row"><h3>{selectedEdit ? 'Edit Campaign' : 'Create Campaign'}</h3><div className="small">Use templates and schedule for automation workflows.</div></div>
              <div className="form-grid">
                <input placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))} />
                <input placeholder="Subject" value={campaignForm.subject} onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))} />
                <select value={campaignForm.templateId} onChange={(e) => setCampaignForm(prev => ({ ...prev, templateId: e.target.value }))}>
                  <option value="">Choose template</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <input placeholder="List name" value={campaignForm.list} onChange={(e) => setCampaignForm(prev => ({ ...prev, list: e.target.value }))} />
                <input type="datetime-local" value={campaignForm.scheduledAt} onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledAt: e.target.value }))} />
              </div>
              <div className="row actions"><button disabled={!campaignIsValid} onClick={selectedEdit ? handleUpdateCampaign : handleAddCampaign}>{selectedEdit ? 'Update Campaign' : 'Create Campaign'}</button></div>
            </div>
            <div className="card"><h3>Campaign list</h3><table><thead><tr><th>Name</th><th>Subject</th><th>Status</th><th>Schedule</th><th>Actions</th></tr></thead><tbody>{campaigns.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.subject}</td><td>{c.status}</td><td>{fmtDate(c.scheduledAt)}</td><td><button onClick={() => handleEditCampaign(c)}>Edit</button><button onClick={async () => { await fetch(`${API}/campaigns/${c.id}/send`, { method: 'POST' }); fetchAll(); }}>Send now</button><button onClick={async () => { await fetch(`${API}/campaigns/${c.id}`, { method: 'DELETE' }); fetchAll(); }}>Delete</button></td></tr>)}</tbody></table></div>
          </>
        )}

        {page === 'Templates' && (
          <>
            <div className="card"><h3>Template Builder</h3><div className="form-grid"><input placeholder="Template title" value={templateForm.title} onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))} /><textarea rows={4} placeholder="Body with {{name}} {{company}}" value={templateForm.body} onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))} /></div><button disabled={!templateForm.title || !templateForm.body} onClick={async () => { await fetch(`${API}/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(templateForm) }); setTemplateForm({ title: '', body: '' }); fetchAll(); }}>Save Template</button></div>
            <div className="card"><h3>Saved templates</h3><ul>{templates.map(t => <li key={t.id}><strong>{t.title}</strong>: {t.body}</li>)}</ul></div>
          </>
        )}

        {page === 'Contacts' && (
          <>
            <div className="card"><h3>Contact list manager</h3><div className="form-grid"><input placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))} /><input placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))} /><input placeholder="Tags comma-separated" value={contactForm.tags} onChange={(e) => setContactForm(prev => ({ ...prev, tags: e.target.value }))} /></div><button onClick={async () => { await fetch(`${API}/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) }); setContactForm({ name: '', email: '', tags: '' }); fetchAll(); }}>Add Contact</button></div>
            <div className="card"><h3>Import contacts from CSV</h3><textarea rows={4} value={csv} onChange={(e) => setCsv(e.target.value)} /><button onClick={async () => {
                const rows = csv.split('\n').slice(1).map(line => {
                  const [name,email,tags] = line.split(',');
                  return { name, email, tags };
                });
                await fetch(`${API}/contacts/import`, { method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ rows }) });
                fetchAll();
              }}>Import CSV</button></div>
            <div className="card"><h3>Contacts</h3><table><thead><tr><th>Name</th><th>Email</th><th>Tags</th><th>Action</th></tr></thead><tbody>{contacts.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.tags.join(', ')}</td><td><button onClick={async () => { await fetch(`${API}/contacts/${c.id}`, { method: 'DELETE' }); fetchAll(); }}>Delete</button></td></tr>)}</tbody></table></div>
          </>
        )}

        {page === 'Analytics' && (
          <>
            <section className="stats-grid">
              <div className="stat"><div>Open rate</div><strong>{analytics.openRate ?? 0}%</strong></div>
              <div className="stat"><div>Bounce rate</div><strong>{analytics.bounceRate ?? 0}%</strong></div>
              <div className="stat"><div>Click rate</div><strong>{analytics.clickRate ?? 0}%</strong></div>
            </section>
            <section className="grid2">
              <div className="card"><h3>Open trend</h3><ResponsiveContainer width="100%" height={240}><LineChart data={analytics.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /> <YAxis /> <Tooltip /> <Line type="monotone" dataKey="opened" stroke="#1f8eed" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
              <div className="card"><h3>Campaign breakdown</h3><ResponsiveContainer width="100%" height={240}><BarChart data={campaignData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Sent" fill="#8884d8" /><Bar dataKey="Opened" fill="#82ca9d" /><Bar dataKey="Clicked" fill="#ff7300" /></BarChart></ResponsiveContainer></div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
