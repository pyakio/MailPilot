import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiX,
  FiMinus,
  FiMaximize2,
  FiMinimize2,
  FiSend,
  FiPaperclip,
  FiTrash2,
  FiZap,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiCode,
  FiCheck,
} from 'react-icons/fi';
import { inboxService } from '../../../services/inboxService';
import { useToast } from '../../../hooks/useToast';

export function EmailComposerModal({
  isOpen,
  onClose,
  initialRecipient = '',
  initialSubject = '',
  initialBody = '',
  threadId = null,
  inReplyTo = null,
  onEmailSent,
}) {
  const { addToast } = useToast();

  const [toRecipients, setToRecipients] = useState([]);
  const [toInput, setToInput] = useState('');
  const [ccRecipients, setCcRecipients] = useState([]);
  const [ccInput, setCcInput] = useState('');
  const [bccRecipients, setBccRecipients] = useState([]);
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [draftId, setDraftId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...', 'Saved', ''
  const [sending, setSending] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [windowState, setWindowState] = useState('normal'); // 'normal' | 'minimized' | 'maximized'

  const bodyRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  const handlePolishDraft = async (tone = 'professional') => {
    if (!body.trim()) {
      addToast({
        type: 'error',
        title: 'Empty Draft',
        message: 'Please write some text before asking AI to polish it.',
      });
      return;
    }

    setPolishing(true);
    setShowAiMenu(false);
    try {
      const res = await inboxService.polishEmail({ text: body, tone });
      if (res?.polishedText) {
        setBody(res.polishedText);
        triggerAutoSave(toRecipients, subject, res.polishedText, draftId);
        addToast({
          type: 'success',
          title: '✨ AI Polish Applied',
          message: `Refined draft with ${tone} tone.`,
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'AI Polish Failed',
        message: err.response?.data?.error || 'Unable to polish draft.',
      });
    } finally {
      setPolishing(false);
    }
  };

  // Initialize form state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialRecipient) {
        const recipients = Array.isArray(initialRecipient)
          ? initialRecipient
          : initialRecipient.split(',').map((r) => r.trim()).filter(Boolean);
        setToRecipients(recipients);
      } else {
        setToRecipients([]);
      }
      setSubject(initialSubject || '');
      setBody(initialBody || '');
      setDraftId(null);
      setSaveStatus('Saved');
      setWindowState('normal');
    }
  }, [isOpen, initialRecipient, initialSubject, initialBody]);

  // Debounced draft auto-save
  const triggerAutoSave = useCallback(
    (toArr, subj, bodyText, curDraftId) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Only auto-save if there is some meaningful content
      if (toArr.length === 0 && !subj && !bodyText) return;

      setSaveStatus('Saving...');
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          const res = await inboxService.saveDraft({
            id: curDraftId || undefined,
            threadId: threadId || undefined,
            to: toArr,
            cc: ccRecipients,
            bcc: bccRecipients,
            subject: subj,
            bodyText: bodyText,
            bodyHtml: bodyText ? `<pre style="font-family: inherit;">${bodyText}</pre>` : '',
          });

          if (res?.draft?.id) {
            setDraftId(res.draft.id);
          }
          setSaveStatus('Draft saved');
        } catch (err) {
          setSaveStatus('');
        }
      }, 1800);
    },
    [threadId, ccRecipients, bccRecipients]
  );

  // Handle adding recipient chips
  const handleAddRecipient = (type, val) => {
    const email = val.trim().replace(/,$/, '');
    if (!email) return;

    if (type === 'to') {
      if (!toRecipients.includes(email)) {
        const next = [...toRecipients, email];
        setToRecipients(next);
        triggerAutoSave(next, subject, body, draftId);
      }
      setToInput('');
    } else if (type === 'cc') {
      if (!ccRecipients.includes(email)) {
        setCcRecipients([...ccRecipients, email]);
      }
      setCcInput('');
    } else if (type === 'bcc') {
      if (!bccRecipients.includes(email)) {
        setBccRecipients([...bccRecipients, email]);
      }
      setBccInput('');
    }
  };

  const handleRemoveRecipient = (type, email) => {
    if (type === 'to') {
      const next = toRecipients.filter((r) => r !== email);
      setToRecipients(next);
      triggerAutoSave(next, subject, body, draftId);
    } else if (type === 'cc') {
      setCcRecipients(ccRecipients.filter((r) => r !== email));
    } else if (type === 'bcc') {
      setBccRecipients(bccRecipients.filter((r) => r !== email));
    }
  };

  const handleSend = async () => {
    let finalTo = [...toRecipients];
    if (toInput.trim()) {
      finalTo.push(toInput.trim());
      setToRecipients(finalTo);
      setToInput('');
    }

    if (finalTo.length === 0) {
      addToast({
        type: 'error',
        title: 'Recipient Required',
        message: 'Please provide at least one recipient email address.',
      });
      return;
    }

    if (!subject.trim() && !body.trim()) {
      addToast({
        type: 'error',
        title: 'Empty Message',
        message: 'Please add a subject or body message before sending.',
      });
      return;
    }

    setSending(true);
    try {
      const res = await inboxService.sendEmail({
        to: finalTo,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: subject.trim() || '(No Subject)',
        bodyText: body,
        bodyHtml: body ? `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;">${body.replace(/\n/g, '<br/>')}</div>` : '',
        threadId: threadId || undefined,
        inReplyTo: inReplyTo || undefined,
        draftId: draftId || undefined,
      });

      addToast({
        type: 'success',
        title: 'Email Sent',
        message: `Message dispatched to ${finalTo.join(', ')}.`,
      });

      if (onEmailSent) {
        onEmailSent(res);
      }

      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Send',
        message: err.response?.data?.error || 'Could not send email.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = async () => {
    if (draftId) {
      try {
        await inboxService.deleteDraft(draftId);
      } catch (err) {
        // ignore
      }
    }
    onClose();
  };

  // Keyboard shortcut: Cmd+Enter / Ctrl+Enter to send
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Formatting helpers
  const applyFormat = (prefix, suffix = prefix) => {
    const el = bodyRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected}${suffix}`;
    const nextBody = text.substring(0, start) + replacement + text.substring(end);
    setBody(nextBody);
    triggerAutoSave(toRecipients, subject, nextBody, draftId);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  if (!isOpen) return null;

  // Minimized Window Bar
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-0 right-8 w-72 bg-[var(--surface-card)] border border-[var(--border)] rounded-t-xl shadow-lg z-50 overflow-hidden select-none">
        <div
          onClick={() => setWindowState('normal')}
          className="p-3 flex items-center justify-between cursor-pointer bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          <span className="text-xs font-semibold text-[var(--text)] truncate">
            {subject || 'New Message'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWindowState('normal');
              }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <FiMaximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal / Maximized Modal Container
  const containerClasses =
    windowState === 'maximized'
      ? 'fixed inset-4 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden'
      : 'fixed bottom-4 right-8 w-[600px] h-[520px] bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden';

  return (
    <div className={containerClasses} onKeyDown={handleKeyDown}>
      {/* Header Toolbar */}
      <div className="p-3 px-4 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-[var(--text)] truncate font-heading">
            {threadId ? 'Reply to Conversation' : 'New Message'}
          </span>
          {saveStatus && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] italic">
              — {saveStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <button
            onClick={() => setWindowState('minimized')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Minimize"
          >
            <FiMinus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWindowState(windowState === 'maximized' ? 'normal' : 'maximized')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title={windowState === 'maximized' ? 'Restore window' : 'Maximize'}
          >
            {windowState === 'maximized' ? (
              <FiMinimize2 className="w-3.5 h-3.5" />
            ) : (
              <FiMaximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Close"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recipient Rows */}
      <div className="divide-y divide-[var(--border)] shrink-0 text-xs">
        {/* To: row */}
        <div className="p-2 px-4 flex items-center gap-2 flex-wrap min-h-[38px]">
          <span className="text-[var(--text-muted)] font-mono shrink-0 w-8">To:</span>
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {toRecipients.map((rec) => (
              <span
                key={rec}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px]"
              >
                {rec}
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient('to', rec)}
                  className="hover:text-red-500"
                >
                  <FiX className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={toRecipients.length === 0 ? 'recipient@example.com (press Enter)' : ''}
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={(e) => {
                if (['Enter', ',', ' '].includes(e.key)) {
                  e.preventDefault();
                  handleAddRecipient('to', toInput);
                } else if (e.key === 'Backspace' && !toInput && toRecipients.length > 0) {
                  handleRemoveRecipient('to', toRecipients[toRecipients.length - 1]);
                }
              }}
              onBlur={() => handleAddRecipient('to', toInput)}
              className="bg-transparent border-0 focus:outline-none text-[var(--text)] text-xs min-w-[140px] flex-1"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] shrink-0">
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="hover:text-[var(--text)] hover:underline"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                className="hover:text-[var(--text)] hover:underline ml-1"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* Cc: row */}
        {showCc && (
          <div className="p-2 px-4 flex items-center gap-2 flex-wrap min-h-[38px]">
            <span className="text-[var(--text-muted)] font-mono shrink-0 w-8">Cc:</span>
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {ccRecipients.map((rec) => (
                <span
                  key={rec}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px]"
                >
                  {rec}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient('cc', rec)}
                    className="hover:text-red-500"
                  >
                    <FiX className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="cc@example.com"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => {
                  if (['Enter', ',', ' '].includes(e.key)) {
                    e.preventDefault();
                    handleAddRecipient('cc', ccInput);
                  }
                }}
                onBlur={() => handleAddRecipient('cc', ccInput)}
                className="bg-transparent border-0 focus:outline-none text-[var(--text)] text-xs min-w-[140px] flex-1"
              />
            </div>
          </div>
        )}

        {/* Bcc: row */}
        {showBcc && (
          <div className="p-2 px-4 flex items-center gap-2 flex-wrap min-h-[38px]">
            <span className="text-[var(--text-muted)] font-mono shrink-0 w-8">Bcc:</span>
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {bccRecipients.map((rec) => (
                <span
                  key={rec}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text)] font-mono text-[11px]"
                >
                  {rec}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient('bcc', rec)}
                    className="hover:text-red-500"
                  >
                    <FiX className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="bcc@example.com"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onKeyDown={(e) => {
                  if (['Enter', ',', ' '].includes(e.key)) {
                    e.preventDefault();
                    handleAddRecipient('bcc', bccInput);
                  }
                }}
                onBlur={() => handleAddRecipient('bcc', bccInput)}
                className="bg-transparent border-0 focus:outline-none text-[var(--text)] text-xs min-w-[140px] flex-1"
              />
            </div>
          </div>
        )}

        {/* Subject row */}
        <div className="p-2 px-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              triggerAutoSave(toRecipients, e.target.value, body, draftId);
            }}
            className="w-full bg-transparent border-0 focus:outline-none text-xs text-[var(--text)] font-semibold placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Editor Body Area */}
      <div className="flex-1 p-4 flex flex-col min-h-0 bg-[var(--surface-card)]">
        <textarea
          ref={bodyRef}
          placeholder="Write your email here..."
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            triggerAutoSave(toRecipients, subject, e.target.value, draftId);
          }}
          className="w-full flex-1 bg-transparent border-0 focus:outline-none text-xs text-[var(--text)] leading-relaxed resize-none placeholder-[var(--text-muted)] font-sans"
        />
      </div>

      {/* Footer Toolbar */}
      <div className="p-3 px-4 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3 shrink-0">
        {/* Left Formatting Buttons */}
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <button
            onClick={() => applyFormat('**', '**')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Bold (**text**)"
          >
            <FiBold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormat('*', '*')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Italic (*text*)"
          >
            <FiItalic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormat('- ')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Bullet list"
          >
            <FiList className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormat('`', '`')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
            title="Inline code"
          >
            <FiCode className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[var(--border)] mx-1" />

          {/* AI Helper trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu(!showAiMenu)}
              disabled={polishing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#E8A33D] hover:bg-[#E8A33D]/15 transition-colors border border-[#E8A33D]/30"
            >
              {polishing ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin" />
                  <span>Polishing...</span>
                </>
              ) : (
                <>
                  <FiZap className="w-3.5 h-3.5" />
                  <span>AI Polish</span>
                </>
              )}
            </button>

            {showAiMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl shadow-xl p-1 z-50 divide-y divide-[var(--border)] text-xs select-none">
                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handlePolishDraft('professional')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text)] transition-colors flex items-center justify-between"
                  >
                    <span>💼 Professional</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Crisp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePolishDraft('concise')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text)] transition-colors flex items-center justify-between"
                  >
                    <span>⚡ Make Concise</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Short</span>
                  </button>
                </div>
                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handlePolishDraft('friendly')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text)] transition-colors flex items-center justify-between"
                  >
                    <span>🤝 Friendly</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Warm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePolishDraft('persuasive')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text)] transition-colors flex items-center justify-between"
                  >
                    <span>🎯 Persuasive</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Action</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDiscard}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded hover:bg-[var(--surface-hover)] transition-colors"
            title="Discard Draft"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#E8A33D] text-[#14171C] hover:bg-[#d9932e] active:scale-[0.98] shadow-sm transition-all disabled:opacity-50"
          >
            {sending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#14171C] border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiSend className="w-3.5 h-3.5" />
                <span>Send</span>
                <kbd className="hidden sm:inline text-[9px] font-mono opacity-70 bg-black/15 px-1 py-0.2 rounded">
                  ⌘↵
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailComposerModal;
