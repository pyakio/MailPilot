// Email HTML Compiler — MailPilot
// Compiles data-driven blocks and style configurations into responsive HTML email and plain-text fallback

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Converts Markdown-style bold, italics, and links into email-safe HTML
 */
function formatMarkdownText(text) {
  if (!text) return '';
  let formatted = escapeHtml(text);

  // Headers (### Header)
  formatted = formatted.replace(/^###\s+(.*$)/gim, '<h4 style="margin: 16px 0 8px 0; font-size: 15px; font-weight: 700; color: inherit;">$1</h4>');
  formatted = formatted.replace(/^##\s+(.*$)/gim, '<h3 style="margin: 20px 0 10px 0; font-size: 18px; font-weight: 700; color: inherit;">$1</h3>');
  formatted = formatted.replace(/^#\s+(.*$)/gim, '<h2 style="margin: 24px 0 12px 0; font-size: 22px; font-weight: 700; color: inherit;">$1</h2>');

  // Code blocks
  formatted = formatted.replace(/```([^`]+)```/g, '<pre style="background: #1e293b; color: #38bdf8; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; overflow-x: auto; margin: 12px 0;">$1</pre>');

  // Bold & Italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links [text](url)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: inherit; text-decoration: underline; font-weight: 600;">$1</a>');

  // Newlines
  formatted = formatted.replace(/\n/g, '<br/>');

  return formatted;
}

/**
 * Compiles a single block into responsive HTML
 */
function compileBlockToHtml(block, globalStyles) {
  const primaryColor = globalStyles?.primaryColor || '#E8A33D';
  const textColor = globalStyles?.textColor || '#1e293b';
  const cardBg = globalStyles?.cardBg || '#ffffff';
  const content = block.content || {};

  switch (block.type) {
    case 'header': {
      const align = content.align || 'left';
      return `
        <div style="margin-bottom: 24px; text-align: ${align};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align: ${align};">
                <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: ${primaryColor}; font-family: sans-serif; display: inline-block;">
                  ${escapeHtml(content.logoText || '⚡ MAILPILOT')}
                </span>
                ${
                  content.badge
                    ? `<span style="margin-left: 10px; background: rgba(232, 163, 61, 0.15); color: ${primaryColor}; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-family: monospace; letter-spacing: 0.05em; display: inline-block; vertical-align: middle;">${escapeHtml(
                        content.badge
                      )}</span>`
                    : ''
                }
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    case 'hero': {
      const align = content.align || 'left';
      return `
        <div style="margin-bottom: 24px; text-align: ${align};">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; line-height: 1.25; font-weight: 800; letter-spacing: -0.03em; color: inherit;">
            ${escapeHtml(content.title || '')}
          </h1>
          ${
            content.subtitle
              ? `<p style="margin: 0; font-size: 15px; line-height: 1.5; opacity: 0.85;">${escapeHtml(content.subtitle)}</p>`
              : ''
          }
        </div>
      `;
    }

    case 'text': {
      return `
        <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6; opacity: 0.9;">
          ${formatMarkdownText(content.body || '')}
        </div>
      `;
    }

    case 'button': {
      const align = content.align || 'left';
      const isPrimary = content.style !== 'outline';
      const bg = isPrimary ? primaryColor : 'transparent';
      const color = isPrimary ? '#14171C' : primaryColor;
      const border = isPrimary ? 'none' : `1.5px solid ${primaryColor}`;
      return `
        <div style="margin: 28px 0; text-align: ${align};">
          <a href="${escapeHtml(content.url || '#')}" style="background-color: ${bg}; color: ${color}; border: ${border}; font-weight: 700; padding: 12px 26px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-family: sans-serif; letter-spacing: -0.01em;">
            ${escapeHtml(content.text || 'Click Here →')}
          </a>
        </div>
      `;
    }

    case 'feature_grid': {
      const items = content.items || [];
      const itemsHtml = items
        .map(
          (item) => `
            <div style="padding: 12px; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; margin-bottom: 8px;">
              <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: inherit;">
                <span style="margin-right: 6px;">${escapeHtml(item.icon || '⚡')}</span>
                ${escapeHtml(item.title || '')}
              </div>
              <div style="font-size: 12px; opacity: 0.8; line-height: 1.4;">
                ${escapeHtml(item.text || '')}
              </div>
            </div>
          `
        )
        .join('');

      return `
        <div style="margin: 20px 0;">
          ${
            content.heading
              ? `<div style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: inherit;">${escapeHtml(
                  content.heading
                )}</div>`
              : ''
          }
          ${itemsHtml}
        </div>
      `;
    }

    case 'announcement': {
      return `
        <div style="background: rgba(232, 163, 61, 0.1); border: 1px solid rgba(232, 163, 61, 0.3); border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          ${
            content.badge
              ? `<span style="font-size: 10px; font-weight: 700; color: ${primaryColor}; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase;">${escapeHtml(
                  content.badge
                )}</span>`
              : ''
          }
          <div style="font-size: 18px; font-weight: 800; margin: 6px 0; color: inherit; letter-spacing: -0.01em;">
            ${escapeHtml(content.title || '')}
          </div>
          ${
            content.text
              ? `<div style="font-size: 13px; opacity: 0.85; line-height: 1.4;">${escapeHtml(content.text)}</div>`
              : ''
          }
        </div>
      `;
    }

    case 'nps_rating': {
      const baseUrl = content.baseUrl || 'https://mailpilot.io/survey?score=';
      const pillsHtml = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .map(
          (num) => `
            <a href="${baseUrl}${num}" style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: rgba(0,0,0,0.06); color: inherit; text-decoration: none; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace; margin: 2px;">
              ${num}
            </a>
          `
        )
        .join('');

      return `
        <div style="margin: 24px 0; padding: 20px 12px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; text-align: center;">
          <div style="margin-bottom: 12px;">
            ${pillsHtml}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.6; font-family: sans-serif; padding: 0 4px;">
            <span>${escapeHtml(content.lowLabel || '0 - Not likely')}</span>
            <span>${escapeHtml(content.highLabel || '10 - Extremely likely')}</span>
          </div>
        </div>
      `;
    }

    case 'divider': {
      return `
        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 24px 0;" />
      `;
    }

    case 'image': {
      if (!content.src) return '';
      return `
        <div style="margin: 20px 0; text-align: ${content.align || 'center'};">
          <img src="${escapeHtml(content.src)}" alt="${escapeHtml(content.alt || 'Visual')}" style="max-width: 100%; height: auto; border-radius: ${content.borderRadius || '8px'}; display: inline-block;" />
        </div>
      `;
    }

    case 'footer': {
      return `
        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.08); font-size: 12px; opacity: 0.7; line-height: 1.5; text-align: center; font-family: sans-serif;">
          ${content.note ? `<p style="margin: 0 0 8px 0;">${escapeHtml(content.note)}</p>` : ''}
          ${
            content.showUnsubscribe !== false
              ? `<p style="margin: 0;"><a href="{{unsubscribe_url}}" style="color: inherit; text-decoration: underline;">Unsubscribe</a> &bull; Powered by <a href="https://mailpilot.io" style="color: inherit; text-decoration: none; font-weight: 600;">MailPilot</a></p>`
              : ''
          }
        </div>
      `;
    }

    default:
      return '';
  }
}

/**
 * Compiles full template object into production responsive HTML email document
 */
export function compileTemplateToHtml(template) {
  if (!template) return '';

  const styles = template.styles || {};
  const canvasBg = styles.canvasBg || '#f1f5f9';
  const cardBg = styles.cardBg || '#ffffff';
  const textColor = styles.textColor || '#1e293b';
  const fontFamily = styles.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const borderRadius = styles.borderRadius || '12px';
  const containerWidth = styles.containerWidth || '600px';

  const blocksHtml = (template.blocks || [])
    .map((b) => compileBlockToHtml(b, styles))
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(template.subject || template.title || 'MailPilot Email')}</title>
  <style>
    @media screen and (max-width: 620px) {
      .mailpilot-container { width: 100% !important; padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: ${canvasBg}; font-family: ${fontFamily}; color: ${textColor}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${canvasBg};">
    <tr>
      <td align="center">
        <div class="mailpilot-container" style="max-width: ${containerWidth}; width: 100%; background-color: ${cardBg}; border-radius: ${borderRadius}; padding: 32px 28px; box-sizing: border-box; text-align: left; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          ${blocksHtml}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates a clean plain-text fallback string from the blocks
 */
export function compileTemplateToText(template) {
  if (!template || !template.blocks) return '';

  const lines = [];

  for (const block of template.blocks) {
    const c = block.content || {};
    if (block.type === 'hero') {
      if (c.title) lines.push(c.title);
      if (c.subtitle) lines.push(c.subtitle);
      lines.push('');
    } else if (block.type === 'text') {
      if (c.body) {
        lines.push(c.body.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)').replace(/[*_#`]/g, ''));
        lines.push('');
      }
    } else if (block.type === 'feature_grid') {
      if (c.heading) lines.push(c.heading);
      (c.items || []).forEach((item) => {
        lines.push(`• ${item.title}: ${item.text}`);
      });
      lines.push('');
    } else if (block.type === 'button') {
      lines.push(`[${c.text || 'Click Here'}]: ${c.url || ''}`);
      lines.push('');
    } else if (block.type === 'announcement') {
      lines.push(`*** ${c.title || ''} ***\n${c.text || ''}`);
      lines.push('');
    } else if (block.type === 'footer') {
      if (c.note) lines.push(c.note);
      lines.push('Unsubscribe: {{unsubscribe_url}}');
    }
  }

  return lines.join('\n').trim();
}
