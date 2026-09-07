const sanitizeHtml = require('sanitize-html');
const { ensureDbConnected, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getUserWorkspaceId } = require('../services/workspace.service');

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'span', 'div',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'center', 'font',
    'style', 'section', 'header', 'footer', 'main',
  ],
  allowedAttributes: {
    '*': ['style', 'class', 'align', 'valign', 'width', 'height', 'bgcolor', 'color', 'cellpadding', 'cellspacing', 'border'],
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowVulnerableTags: true,
};

function sanitizeContent(html) {
  if (!html) return html;
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/**
 * GET /api/templates
 * List templates scoped to authenticated user's workspace.
 * Automatically seeds the 20 pre-built starter templates if workspace has 0 templates.
 */
async function getAll(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    let templates = await prisma.template.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed for new workspaces (e.g. Google Auth / New Registered Users)
    if (!templates || templates.length === 0) {
      const defaultTemplates = await prisma.template.findMany({
        where: { workspaceId: 'ws_default_01' },
      });

      if (defaultTemplates && defaultTemplates.length > 0) {
        for (const tmpl of defaultTemplates) {
          await prisma.template.create({
            data: {
              workspaceId,
              title: tmpl.title,
              subject: tmpl.subject,
              category: tmpl.category,
              body: tmpl.body,
              htmlBody: tmpl.htmlBody,
              thumbnail: tmpl.thumbnail || `/templates/${tmpl.id}.svg`,
            },
          });
        }

        templates = await prisma.template.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    res.json(templates);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/templates/:id
 * Get single template with workspace isolation
 */
async function getOne(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const template = await prisma.template.findFirst({
      where: { id, workspaceId },
    });

    if (!template) {
      throw new ApiError(404, 'Template not found or access denied.');
    }

    res.json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/templates
 * Create template for authenticated user's workspace
 */
async function create(req, res, next) {
  try {
    ensureDbConnected();
    const { title, body, subject, category, htmlBody, thumbnail } = req.body;

    if (!title || !body) {
      throw new ApiError(400, 'Template title and body are required.');
    }

    const workspaceId = await getUserWorkspaceId(req.user.id);

    const template = await prisma.template.create({
      data: {
        workspaceId,
        title: title.trim(),
        subject: subject ? subject.trim() : null,
        body: sanitizeContent(body.trim()),
        htmlBody: htmlBody ? sanitizeContent(htmlBody.trim()) : null,
        thumbnail: thumbnail || null,
        category: category || 'custom',
      },
    });

    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/templates/:id
 * Update template with workspace isolation
 */
async function update(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.template.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Template not found or access denied.');
    }

    const { title, body, subject, category, htmlBody, thumbnail } = req.body;

    const updated = await prisma.template.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        body: body !== undefined ? sanitizeContent(body.trim()) : undefined,
        subject: subject !== undefined ? (subject ? subject.trim() : null) : undefined,
        htmlBody: htmlBody !== undefined ? (htmlBody ? sanitizeContent(htmlBody.trim()) : null) : undefined,
        thumbnail: thumbnail !== undefined ? thumbnail : undefined,
        category: category !== undefined ? category : undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/templates/:id
 * Delete template with workspace isolation
 */
async function remove(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.template.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Template not found or access denied.');
    }

    await prisma.template.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Template deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
