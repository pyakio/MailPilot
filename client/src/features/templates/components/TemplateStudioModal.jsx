import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import { useToast } from '../../../hooks/useToast';
import { aiService } from '../../../services/aiService';
import { compileTemplateToHtml, compileTemplateToText } from '../utils/emailCompiler';
import {
  FiX,
  FiSave,
  FiSend,
  FiEye,
  FiCode,
  FiSmartphone,
  FiMonitor,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiArrowUp,
  FiArrowDown,
  FiZap,
  FiSliders,
  FiLayers,
  FiType,
  FiCheck,
  FiRefreshCw,
  FiEdit3,
} from 'react-icons/fi';

const BLOCK_TYPES = [
  { type: 'header', label: 'Header / Logo', icon: '⚡', desc: 'Brand logo & preheader badge' },
  { type: 'hero', label: 'Hero Headline', icon: '🚀', desc: 'Big title and supporting subtitle' },
  { type: 'text', label: 'Rich Text', icon: '📝', desc: 'Paragraphs, bullet lists, markdown' },
  { type: 'button', label: 'Call to Action', icon: '🔘', desc: 'Clickable primary/secondary button' },
  { type: 'feature_grid', label: 'Feature Grid', icon: '✨', desc: '2 or 3 column highlight cards' },
  { type: 'announcement', label: 'Announcement', icon: '📣', desc: 'Callout badge and headline card' },
  { type: 'nps_rating', label: 'NPS Rating (1-10)', icon: '⭐', desc: '1-click customer feedback row' },
  { type: 'image', label: 'Image / Artwork', icon: '🖼️', desc: 'Visual banner or screenshot' },
  { type: 'divider', label: 'Divider Line', icon: '➖', desc: 'Subtle visual separator' },
  { type: 'footer', label: 'Footer & Unsubscribe', icon: '📜', desc: 'Legal note & compliance link' },
];

const FONT_OPTIONS = [
  { label: 'Modern Sans-Serif (Inter / System)', value: 'sans-serif' },
  { label: 'Editorial Serif (Georgia / Garamond)', value: 'serif' },
  { label: 'Technical Monospace (JetBrains)', value: 'monospace' },
];

const PRESET_PALETTES = [
  { name: 'Amber Cockpit', canvas: '#f8fafc', card: '#ffffff', primary: '#E8A33D', text: '#0f172a' },
  { name: 'Dark Mode SaaS', canvas: '#0f1318', card: '#1b1e24', primary: '#E8A33D', text: '#f1f5f9' },
  { name: 'Steel Indigo', canvas: '#f0f9ff', card: '#ffffff', primary: '#2563eb', text: '#1e293b' },
  { name: 'Emerald Growth', canvas: '#f0fdf4', card: '#ffffff', primary: '#16a34a', text: '#14532d' },
  { name: 'Midnight Violet', canvas: '#09090b', card: '#18181b', primary: '#a855f7', text: '#fafafa' },
];

export function TemplateStudioModal({ isOpen, onClose, onSave, onUseInCampaign, initialTemplate = null, loading = false }) {
  const { addToast } = useToast();

  // Template State
  const [template, setTemplate] = useState(() => {
    return (
      initialTemplate || {
        id: `tmpl_${Date.now()}`,
        title: 'New Email Template',
        category: 'newsletter',
        subject: 'Special update for {{first_name}}',
        styles: {
          canvasBg: '#f8fafc',
          cardBg: '#ffffff',
          primaryColor: '#E8A33D',
          textColor: '#0f172a',
          fontFamily: 'sans-serif',
          borderRadius: '12px',
          containerWidth: '600px',
        },
        blocks: [
          { id: 'b1', type: 'header', content: { logoText: '⚡ MAILPILOT', badge: 'NEWSLETTER', align: 'left' } },
          { id: 'b2', type: 'hero', content: { title: 'Welcome to your weekly update', subtitle: 'Here is what we have prepared for you today.', align: 'left' } },
          { id: 'b3', type: 'text', content: { body: 'Hi {{first_name}},\n\nWrite your email announcement or newsletter story right here. You can use **bold text**, *italics*, and [links](https://mailpilot.io).' } },
          { id: 'b4', type: 'button', content: { text: 'Read Full Post →', url: 'https://mailpilot.io', align: 'left', style: 'primary' } },
          { id: 'b5', type: 'footer', content: { note: 'You received this email from {{workspace_name}}.', showUnsubscribe: true } },
        ],
      }
    );
  });

  // Editor Interaction State
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'theme' | 'library' | 'ai'
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'html' | 'text'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [mobilePane, setMobilePane] = useState('canvas'); // 'canvas' | 'inspector' (mobile screens)
  const [history, setHistory] = useState([]);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialTemplate && isOpen) {
      // If template has blocks, load them; if only raw htmlBody, construct basic blocks
      if (initialTemplate.blocks && Array.isArray(initialTemplate.blocks) && initialTemplate.blocks.length > 0) {
        setTemplate(initialTemplate);
      } else {
        setTemplate({
          ...initialTemplate,
          styles: initialTemplate.styles || {
            canvasBg: '#f8fafc',
            cardBg: '#ffffff',
            primaryColor: '#E8A33D',
            textColor: '#0f172a',
            fontFamily: 'sans-serif',
            borderRadius: '12px',
            containerWidth: '600px',
          },
          blocks: [
            { id: 'b1', type: 'header', content: { logoText: '⚡ MAILPILOT', badge: initialTemplate.category?.toUpperCase() || 'UPDATE', align: 'left' } },
            { id: 'b2', type: 'hero', content: { title: initialTemplate.title || 'Email Announcement', subtitle: initialTemplate.subject || '', align: 'left' } },
            { id: 'b3', type: 'text', content: { body: initialTemplate.body || 'Email content...' } },
            { id: 'b4', type: 'button', content: { text: 'Learn More →', url: 'https://mailpilot.io', align: 'left', style: 'primary' } },
            { id: 'b5', type: 'footer', content: { note: 'Sent from {{workspace_name}}.', showUnsubscribe: true } },
          ],
        });
      }
      setSelectedBlockId(null);
      setHistory([]);
    }
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  // History Recording
  const pushState = (newTemplate) => {
    setHistory((prev) => [...prev.slice(-10), template]);
    setTemplate(newTemplate);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setTemplate(last);
  };

  // Block Manipulation
  const selectedBlock = template.blocks?.find((b) => b.id === selectedBlockId);

  const updateBlockContent = (blockId, contentUpdates) => {
    const updatedBlocks = template.blocks.map((b) => {
      if (b.id === blockId) {
        return { ...b, content: { ...b.content, ...contentUpdates } };
      }
      return b;
    });
    pushState({ ...template, blocks: updatedBlocks });
  };

  const updateTemplateStyles = (styleUpdates) => {
    pushState({
      ...template,
      styles: { ...template.styles, ...styleUpdates },
    });
  };

  const handleAddBlock = (type) => {
    const newId = `b_${Date.now().toString(36)}`;
    let newBlock = { id: newId, type, content: {} };

    switch (type) {
      case 'header':
        newBlock.content = { logoText: '⚡ MAILPILOT', badge: 'NEW', align: 'left' };
        break;
      case 'hero':
        newBlock.content = { title: 'Compelling Headline Here', subtitle: 'Supporting subtitle to provide quick context.', align: 'left' };
        break;
      case 'text':
        newBlock.content = { body: 'Enter your paragraph text here. Supports **bold**, *italics*, and bullet lists.' };
        break;
      case 'button':
        newBlock.content = { text: 'Explore Now →', url: 'https://mailpilot.io', align: 'left', style: 'primary' };
        break;
      case 'feature_grid':
        newBlock.content = {
          heading: 'Key Highlights:',
          items: [
            { icon: '🚀', title: 'High Speed', text: 'Lightning fast broadcast pipeline.' },
            { icon: '🛡️', title: 'Top Security', text: 'SPF and DKIM verified.' },
          ],
        };
        break;
      case 'announcement':
        newBlock.content = { badge: 'SPECIAL ANNOUNCEMENT', title: 'Huge Update Just Dropped', text: 'Check out the new features inside your dashboard today.' };
        break;
      case 'nps_rating':
        newBlock.content = { baseUrl: 'https://mailpilot.io/survey?score=', lowLabel: '0 - Not likely', highLabel: '10 - Very likely' };
        break;
      case 'image':
        newBlock.content = { src: '/templates/tmpl_01.svg', alt: 'Visual', align: 'center', borderRadius: '8px' };
        break;
      case 'divider':
        newBlock.content = {};
        break;
      case 'footer':
        newBlock.content = { note: 'You received this from {{workspace_name}}.', showUnsubscribe: true };
        break;
      default:
        break;
    }

    pushState({ ...template, blocks: [...template.blocks, newBlock] });
    setSelectedBlockId(newId);
    setActiveTab('blocks');
    addToast({ title: 'Block Added', message: `Added ${type} block to your template.`, type: 'info' });
  };

  const handleMoveBlock = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= template.blocks.length) return;
    const newBlocks = [...template.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);
    pushState({ ...template, blocks: newBlocks });
  };

  const handleDuplicateBlock = (block) => {
    const newId = `b_${Date.now().toString(36)}`;
    const cloned = JSON.parse(JSON.stringify(block));
    cloned.id = newId;
    const idx = template.blocks.findIndex((b) => b.id === block.id);
    const newBlocks = [...template.blocks];
    newBlocks.splice(idx + 1, 0, cloned);
    pushState({ ...template, blocks: newBlocks });
    setSelectedBlockId(newId);
  };

  const handleDeleteBlock = (blockId) => {
    const newBlocks = template.blocks.filter((b) => b.id !== blockId);
    pushState({ ...template, blocks: newBlocks });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  // AI Assistant trigger
  const handleAiImprove = async (goal) => {
    if (!selectedBlock) {
      addToast({ title: 'Select a Block', message: 'Click any text or hero block to improve with AI.', type: 'warning' });
      return;
    }
    try {
      setAiLoading(true);
      const textToImprove = selectedBlock.content?.title || selectedBlock.content?.body || selectedBlock.content?.subtitle || '';
      const prompt = `Rewrite this email marketing text to be more engaging and high-converting (Goal: ${goal}). Return ONLY the improved text, no explanation.\n\nText: "${textToImprove}"`;
      
      const res = await aiService.askAssistant([
        { role: 'system', content: 'You are an elite SaaS email marketer. Rewrite copy directly and punchily.' },
        { role: 'user', content: prompt }
      ]);
      
      const reply = res.reply || res;
      if (selectedBlock.type === 'hero') {
        updateBlockContent(selectedBlock.id, { title: reply.replace(/^"|"$/g, '').trim() });
      } else if (selectedBlock.type === 'text') {
        updateBlockContent(selectedBlock.id, { body: reply.trim() });
      }
      addToast({ title: 'AI Refinement Applied', message: 'Block copy updated successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'AI Error', message: err.message, type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  // Compile & Save
  const handleSaveTemplate = () => {
    const compiledHtml = compileTemplateToHtml(template);
    const compiledText = compileTemplateToText(template);

    onSave({
      id: template.id,
      title: template.title || 'Untitled Template',
      subject: template.subject || 'Default Subject',
      category: template.category || 'newsletter',
      body: compiledText,
      htmlBody: compiledHtml,
      thumbnail: template.thumbnail || '/templates/tmpl_01.svg',
      blocks: template.blocks,
      styles: template.styles,
    });
  };

  const handleUseCampaign = () => {
    const compiledHtml = compileTemplateToHtml(template);
    const compiledText = compileTemplateToText(template);

    onUseInCampaign({
      ...template,
      body: compiledText,
      htmlBody: compiledHtml,
    });
  };

  const handleCopyHtml = () => {
    const html = compileTemplateToHtml(template);
    navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
    addToast({ title: 'HTML Copied', message: 'Full responsive email HTML copied to clipboard.', type: 'success' });
  };

  const styles = template.styles || {};

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e14] text-slate-100 overflow-hidden animate-fade-in font-sans">
      {/* ─── Top Studio Navbar ─── */}
      <header className="h-[56px] border-b border-slate-800 bg-[#12161f] px-3 sm:px-4 flex items-center justify-between shrink-0 gap-2">
        {/* Left: Brand & Template Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#E8A33D] font-bold text-base sm:text-lg">⚡</span>
            <span className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider hidden lg:inline">
              Studio
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Editable Title Input */}
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={template.title}
              onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              placeholder="Template Title"
              className="bg-transparent border border-transparent hover:border-slate-700 focus:border-[#E8A33D] rounded px-2 py-1 text-xs sm:text-sm font-bold text-slate-100 focus:outline-none transition-colors w-28 sm:w-48 md:w-60 truncate"
            />
            <Badge variant="amber" className="capitalize text-[10px] hidden xl:inline">
              {template.category}
            </Badge>
          </div>
        </div>

        {/* Center: Device & Mode Switchers (Desktop) + Mobile Pane Switcher (Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Screen Pane Switcher (< md) */}
          <div className="flex md:hidden bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setMobilePane('canvas')}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors ${
                mobilePane === 'canvas' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiEdit3 className="w-3 h-3" />
              Canvas
            </button>
            <button
              onClick={() => setMobilePane('inspector')}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors ${
                mobilePane === 'inspector' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiSliders className="w-3 h-3" />
              Tools
            </button>
          </div>

          {/* Canvas vs HTML Preview (Desktop/Tablet) */}
          <div className="hidden md:flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                viewMode === 'canvas' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              Canvas
            </button>
            <button
              onClick={() => setViewMode('html')}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                viewMode === 'html' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              HTML Preview
            </button>
          </div>

          {/* Desktop vs Mobile Simulation */}
          <div className="hidden lg:flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded transition-colors ${viewport === 'desktop' ? 'bg-slate-800 text-[#E8A33D]' : 'text-slate-400 hover:text-slate-200'}`}
              title="Desktop View (600px)"
            >
              <FiMonitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded transition-colors ${viewport === 'mobile' ? 'bg-slate-800 text-[#E8A33D]' : 'text-slate-400 hover:text-slate-200'}`}
              title="Mobile View (360px)"
            >
              <FiSmartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors hidden sm:inline-flex"
            title="Undo last change"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            size="xs"
            variant="outline"
            icon={copiedHtml ? FiCheck : FiCode}
            onClick={handleCopyHtml}
            className="hidden xl:flex"
          >
            {copiedHtml ? 'Copied' : 'Export HTML'}
          </Button>
          <Button
            size="xs"
            variant="outline"
            icon={FiSend}
            onClick={handleUseCampaign}
            className="hidden sm:inline-flex"
          >
            Use in Campaign
          </Button>
          <Button
            size="xs"
            variant="primary"
            icon={FiSave}
            onClick={handleSaveTemplate}
            loading={loading}
          >
            Save
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            aria-label="Close studio"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Studio Main Workspace ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Main Interactive Canvas (Center) ─── */}
        <main
          className={`flex-1 overflow-y-auto p-3 sm:p-8 ${
            mobilePane === 'canvas' ? 'flex' : 'hidden md:flex'
          } items-start justify-center`}
          style={{ backgroundColor: viewMode === 'canvas' ? '#080a0f' : '#0f172a' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBlockId(null);
          }}
        >
          {viewMode === 'canvas' ? (
            /* Canva-Style WYSIWYG Live Canvas Container */
            <div
              className="transition-all duration-300 shadow-2xl rounded-xl relative"
              style={{
                width: viewport === 'mobile' ? '360px' : styles.containerWidth || '600px',
                maxWidth: '100%',
                backgroundColor: styles.canvasBg || '#f8fafc',
                padding: '24px 12px',
                fontFamily: styles.fontFamily || 'sans-serif',
              }}
            >
              {/* Email Card Container */}
              <div
                className="rounded-xl border border-black/5 shadow-md p-6 sm:p-8 relative"
                style={{
                  backgroundColor: styles.cardBg || '#ffffff',
                  color: styles.textColor || '#0f172a',
                  borderRadius: styles.borderRadius || '12px',
                }}
              >
                {/* Visual Block Stack */}
                <div className="space-y-4">
                  {template.blocks?.map((block, index) => {
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        className={`relative group rounded-lg p-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[#E8A33D] bg-[#E8A33D]/5'
                            : 'hover:ring-1 hover:ring-[#E8A33D]/40'
                        }`}
                      >
                        {/* Hover Quick Action Floater Bar */}
                        <div
                          className={`absolute -top-3.5 right-2 z-20 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md px-1 py-0.5 shadow-lg transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-amber-400 font-bold uppercase px-1">
                            {block.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20"
                            title="Move Up"
                          >
                            <FiArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'down');
                            }}
                            disabled={index === template.blocks.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20"
                            title="Move Down"
                          >
                            <FiArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBlock(block);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-400"
                            title="Duplicate"
                          >
                            <FiCopy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Rendered Block Body in WYSIWYG */}
                        <div className="relative">
                          {block.type === 'header' && (
                            <div
                              className={`flex items-center justify-between pb-4 border-b border-black/10 text-${block.content.align || 'left'}`}
                            >
                              <span className="font-bold text-base tracking-tight font-heading">
                                {block.content.logoText || '⚡ MAILPILOT'}
                              </span>
                              {block.content.badge && (
                                <span
                                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: styles.primaryColor || '#E8A33D',
                                    color: '#14171C',
                                  }}
                                >
                                  {block.content.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {block.type === 'hero' && (
                            <div className={`space-y-2 text-${block.content.align || 'left'} py-2`}>
                              <h1 className="text-2xl font-bold font-heading tracking-tight leading-tight">
                                {block.content.title || 'Hero Title Goes Here'}
                              </h1>
                              {block.content.subtitle && (
                                <p className="text-sm opacity-80 leading-relaxed font-sans">
                                  {block.content.subtitle}
                                </p>
                              )}
                            </div>
                          )}

                          {block.type === 'text' && (
                            <div className="text-sm leading-relaxed whitespace-pre-line py-1 opacity-90">
                              {block.content.body || 'Type your message text here...'}
                            </div>
                          )}

                          {block.type === 'button' && (
                            <div className={`py-3 text-${block.content.align || 'left'}`}>
                              <a
                                href={block.content.url || '#'}
                                onClick={(e) => e.preventDefault()}
                                className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wide shadow-sm"
                                style={{
                                  backgroundColor: block.content.style === 'secondary' ? (styles.secondaryColor || '#3E6B70') : (styles.primaryColor || '#E8A33D'),
                                  color: '#14171C',
                                }}
                              >
                                {block.content.text || 'Call to Action →'}
                              </a>
                            </div>
                          )}

                          {block.type === 'feature_grid' && (
                            <div className="py-2 space-y-2">
                              {block.content.heading && (
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider opacity-75">
                                  {block.content.heading}
                                </h4>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {block.content.items?.map((item, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-black/5 border border-black/5 space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-xs">
                                      <span>{item.icon || '⚡'}</span>
                                      <span>{item.title}</span>
                                    </div>
                                    <p className="text-[11px] opacity-75">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {block.type === 'announcement' && (
                            <div
                              className="p-4 rounded-xl space-y-2"
                              style={{
                                backgroundColor: `${styles.primaryColor || '#E8A33D'}18`,
                                borderLeft: `4px solid ${styles.primaryColor || '#E8A33D'}`,
                              }}
                            >
                              {block.content.badge && (
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/10 text-slate-800 dark:text-slate-200">
                                  {block.content.badge}
                                </span>
                              )}
                              <h3 className="font-bold text-sm">{block.content.title}</h3>
                              <p className="text-xs opacity-85 leading-relaxed">{block.content.text}</p>
                            </div>
                          )}

                          {block.type === 'nps_rating' && (
                            <div className="py-3 space-y-2">
                              <p className="text-xs font-semibold text-center opacity-80">
                                How likely are you to recommend us?
                              </p>
                              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    className="w-7 h-7 rounded text-[11px] font-mono font-bold bg-black/5 hover:bg-amber-400 hover:text-black border border-black/10 transition-colors flex items-center justify-center shrink-0"
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                              <div className="flex justify-between text-[10px] opacity-60 px-1 font-mono">
                                <span>{block.content.lowLabel || '0 - Not likely'}</span>
                                <span>{block.content.highLabel || '10 - Very likely'}</span>
                              </div>
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className={`py-2 text-${block.content.align || 'center'}`}>
                              <img
                                src={block.content.src || '/templates/tmpl_01.svg'}
                                alt={block.content.alt || 'Template visual'}
                                className="max-w-full inline-block rounded-lg shadow-sm border border-black/10"
                                style={{ borderRadius: block.content.borderRadius || '8px' }}
                              />
                            </div>
                          )}

                          {block.type === 'divider' && (
                            <hr className="my-4 border-black/10" />
                          )}

                          {block.type === 'footer' && (
                            <div className="pt-4 border-t border-black/10 text-center text-xs opacity-70 space-y-1">
                              {block.content.note && <p>{block.content.note}</p>}
                              {block.content.showUnsubscribe && (
                                <p className="text-[11px] underline">Unsubscribe • Powered by MailPilot</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Quick Add Block Button */}
                <div className="mt-8 pt-4 border-t border-dashed border-black/10 text-center">
                  <button
                    onClick={() => setActiveTab('library')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-black/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <FiPlus className="w-3.5 h-3.5 text-[#E8A33D]" />
                    Add Block to Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Rendered HTML Production Preview */
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden p-6 text-slate-900 border border-slate-300">
              <div
                dangerouslySetInnerHTML={{
                  __html: compileTemplateToHtml(template),
                }}
              />
            </div>
          )}
        </main>

        {/* ─── Inspector & Customizer Sidebar (Right) ─── */}
        <aside
          className={`w-full md:w-96 border-l border-slate-800 bg-[#12161f] ${
            mobilePane === 'inspector' ? 'flex' : 'hidden md:flex'
          } flex-col shrink-0`}
        >
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 shrink-0">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'blocks' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiSliders className="w-3.5 h-3.5" />
              Inspector
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'theme' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiType className="w-3.5 h-3.5" />
              Styles
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'library' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiLayers className="w-3.5 h-3.5" />
              Blocks
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'ai' ? 'bg-[#E8A33D] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiZap className="w-3.5 h-3.5" />
              AI Copilot
            </button>
          </div>

          {/* Sidebar Content Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* ─── TAB 1: BLOCK INSPECTOR ─── */}
            {activeTab === 'blocks' && (
              <div className="space-y-4">
                {selectedBlock ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">
                        Editing: {selectedBlock.type}
                      </span>
                      <button
                        onClick={() => handleDeleteBlock(selectedBlock.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" /> Remove Block
                      </button>
                    </div>

                    {/* Header Block Controls */}
                    {selectedBlock.type === 'header' && (
                      <div className="space-y-3">
                        <Input
                          label="Brand / Logo Text"
                          value={selectedBlock.content?.logoText || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { logoText: e.target.value })}
                        />
                        <Input
                          label="Preheader Badge Text"
                          value={selectedBlock.content?.badge || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { badge: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Hero Block Controls */}
                    {selectedBlock.type === 'hero' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Headline</label>
                          <textarea
                            rows={2}
                            value={selectedBlock.content?.title || ''}
                            onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#E8A33D]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Supporting Subtitle</label>
                          <textarea
                            rows={2}
                            value={selectedBlock.content?.subtitle || ''}
                            onChange={(e) => updateBlockContent(selectedBlock.id, { subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#E8A33D]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-mono text-slate-400 uppercase">Alignment</label>
                          <div className="flex gap-2">
                            {['left', 'center', 'right'].map((align) => (
                              <button
                                key={align}
                                onClick={() => updateBlockContent(selectedBlock.id, { align })}
                                className={`flex-1 py-1 text-xs font-mono rounded capitalize border ${
                                  selectedBlock.content?.align === align ? 'bg-[#E8A33D] text-slate-950 font-bold border-[#E8A33D]' : 'border-slate-700 text-slate-400'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Block Controls */}
                    {selectedBlock.type === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Markdown Body Text</label>
                          <textarea
                            rows={6}
                            value={selectedBlock.content?.body || ''}
                            onChange={(e) => updateBlockContent(selectedBlock.id, { body: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-[#E8A33D]"
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Supports **bold**, *italics*, # headers, and [link text](url).
                        </div>
                      </div>
                    )}

                    {/* Button Block Controls */}
                    {selectedBlock.type === 'button' && (
                      <div className="space-y-3">
                        <Input
                          label="Button Label"
                          value={selectedBlock.content?.text || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { text: e.target.value })}
                        />
                        <Input
                          label="Target Click URL"
                          value={selectedBlock.content?.url || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { url: e.target.value })}
                        />
                        <div className="space-y-1">
                          <label className="block text-xs font-mono text-slate-400 uppercase">Button Style</label>
                          <div className="flex gap-2">
                            {['primary', 'outline'].map((style) => (
                              <button
                                key={style}
                                onClick={() => updateBlockContent(selectedBlock.id, { style })}
                                className={`flex-1 py-1 text-xs font-mono rounded capitalize border ${
                                  selectedBlock.content?.style === style ? 'bg-[#E8A33D] text-slate-950 font-bold border-[#E8A33D]' : 'border-slate-700 text-slate-400'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Announcement Block Controls */}
                    {selectedBlock.type === 'announcement' && (
                      <div className="space-y-3">
                        <Input
                          label="Top Badge"
                          value={selectedBlock.content?.badge || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { badge: e.target.value })}
                        />
                        <Input
                          label="Headline"
                          value={selectedBlock.content?.title || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { title: e.target.value })}
                        />
                        <Input
                          label="Description"
                          value={selectedBlock.content?.text || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { text: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Image Block Controls */}
                    {selectedBlock.type === 'image' && (
                      <div className="space-y-3">
                        <Input
                          label="Image URL"
                          value={selectedBlock.content?.src || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { src: e.target.value })}
                        />
                        <Input
                          label="Alt Text"
                          value={selectedBlock.content?.alt || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { alt: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Footer Block Controls */}
                    {selectedBlock.type === 'footer' && (
                      <div className="space-y-3">
                        <Input
                          label="Disclaimer Note"
                          value={selectedBlock.content?.note || ''}
                          onChange={(e) => updateBlockContent(selectedBlock.id, { note: e.target.value })}
                        />
                        <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={selectedBlock.content?.showUnsubscribe !== false}
                            onChange={(e) => updateBlockContent(selectedBlock.id, { showUnsubscribe: e.target.checked })}
                            className="rounded accent-[#E8A33D]"
                          />
                          Include One-Click Unsubscribe Link
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state when no block selected */
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <FiSliders className="w-8 h-8 mx-auto text-[#E8A33D]/60" />
                    <p className="text-sm font-semibold text-slate-200">No Block Selected</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Click any element in the canvas to customize its typography, text, URLs, and styling.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: GLOBAL STYLES & PALETTES ─── */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">Color Presets</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PRESET_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() =>
                          updateTemplateStyles({
                            canvasBg: palette.canvas,
                            cardBg: palette.card,
                            primaryColor: palette.primary,
                            textColor: palette.text,
                          })
                        }
                        className="p-2 bg-slate-900 border border-slate-800 hover:border-[#E8A33D] rounded-lg text-left text-xs font-mono flex items-center gap-2 transition-colors"
                      >
                        <div className="flex gap-1 shrink-0">
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: palette.card }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.primary }} />
                        </div>
                        <span className="truncate text-slate-300">{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">Individual Colors</span>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Canvas Background</label>
                    <input
                      type="color"
                      value={styles.canvasBg || '#f8fafc'}
                      onChange={(e) => updateTemplateStyles({ canvasBg: e.target.value })}
                      className="w-full h-8 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Card / Container Background</label>
                    <input
                      type="color"
                      value={styles.cardBg || '#ffffff'}
                      onChange={(e) => updateTemplateStyles({ cardBg: e.target.value })}
                      className="w-full h-8 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Primary Accent & Button Color</label>
                    <input
                      type="color"
                      value={styles.primaryColor || '#E8A33D'}
                      onChange={(e) => updateTemplateStyles({ primaryColor: e.target.value })}
                      className="w-full h-8 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={styles.textColor || '#0f172a'}
                      onChange={(e) => updateTemplateStyles({ textColor: e.target.value })}
                      className="w-full h-8 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Typography Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-mono text-[#E8A33D] font-bold uppercase">Typography Family</label>
                  <select
                    value={styles.fontFamily || 'sans-serif'}
                    onChange={(e) => updateTemplateStyles({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#E8A33D]"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ─── TAB 3: BLOCK LIBRARY ─── */}
            {activeTab === 'library' && (
              <div className="space-y-3">
                <div className="pb-1 border-b border-slate-800">
                  <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">Click to Insert Block</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {BLOCK_TYPES.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleAddBlock(item.type)}
                      className="p-3 bg-slate-900/90 border border-slate-800 hover:border-[#E8A33D] hover:bg-slate-800/80 rounded-lg text-left transition-all flex items-center gap-3 group"
                    >
                      <span className="text-xl shrink-0 p-2 bg-slate-800 group-hover:bg-[#E8A33D]/20 rounded-md">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-[#E8A33D] transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 4: AI COPILOT ─── */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">AI Copy Studio</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select any block in the canvas and trigger AI to rewrite or enhance its persuasive power.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-semibold">1-Click Rewrite Goals:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { goal: 'Make it more urgent and high-converting', label: '🔥 High Urgency / FOMO' },
                      { goal: 'Make it friendly, warm and personal', label: '👋 Friendly & Conversational' },
                      { goal: 'Make it concise, punchy and direct', label: '⚡ Short & Punchy' },
                      { goal: 'Highlight clear SaaS ROI and metrics', label: '📈 Value & Social Proof' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        disabled={aiLoading}
                        onClick={() => handleAiImprove(item.goal)}
                        className="w-full text-left p-2.5 bg-slate-900 border border-slate-800 hover:border-[#E8A33D] rounded-lg text-xs text-slate-300 hover:text-slate-100 flex items-center justify-between transition-colors disabled:opacity-50"
                      >
                        <span>{item.label}</span>
                        <FiZap className="w-3 h-3 text-[#E8A33D]" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Subject Line Enhancer */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-[#E8A33D] font-bold uppercase">Subject Line Generator</span>
                  <Input
                    label="Current Subject Line"
                    value={template.subject || ''}
                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  />
                  <Button
                    size="xs"
                    variant="outline"
                    icon={FiZap}
                    loading={aiLoading}
                    onClick={async () => {
                      try {
                        setAiLoading(true);
                        const res = await aiService.getSubjectLines({
                          topic: template.title || 'Product Update',
                          audience: 'SaaS Subscribers',
                          tone: 'Engaging',
                        });
                        const suggestions = res.variations || res || [];
                        if (suggestions.length > 0 && suggestions[0].subject) {
                          setTemplate({ ...template, subject: suggestions[0].subject });
                          addToast({ title: 'Subject Updated', message: `Suggested: "${suggestions[0].subject}"`, type: 'success' });
                        }
                      } catch (err) {
                        addToast({ title: 'AI Error', message: err.message, type: 'error' });
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >
                    Generate AI Subject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TemplateStudioModal;
