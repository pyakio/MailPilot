// Contacts Controller — MailPilot
// Subscriber list management powered by Prisma ORM and Supabase PostgreSQL
// Enforces strict multi-tenant workspace isolation

const { getConnectionStatus, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getUserWorkspaceId } = require('../services/workspace.service');

function ensureDbConnected() {
  if (!getConnectionStatus()) {
    throw new ApiError(
      503,
      'Database connection unavailable. Please ensure DATABASE_URL is configured in server/.env.'
    );
  }
}

/**
 * GET /api/contacts
 * List contacts scoped to authenticated user's workspace
 */
async function getAll(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const contacts = await prisma.contact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/contacts
 * Create contact for authenticated user's workspace
 */
async function create(req, res, next) {
  try {
    ensureDbConnected();
    const { email, name, tags } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email address is required.');
    }

    const emailLower = email.toLowerCase().trim();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    // Check duplicate within this workspace
    const existing = await prisma.contact.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email: emailLower,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, 'A subscriber with this email already exists in your audience.');
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const contact = await prisma.contact.create({
      data: {
        workspaceId,
        email: emailLower,
        name: name ? name.trim() : emailLower.split('@')[0],
        tags: parsedTags,
        subscribed: true,
        source: 'manual',
      },
    });

    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/contacts/:id
 * Update contact with workspace isolation
 */
async function update(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Contact not found or access denied.');
    }

    const { name, email, tags, subscribed } = req.body;

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        email: email !== undefined ? email.toLowerCase().trim() : undefined,
        tags: parsedTags,
        subscribed: subscribed !== undefined ? Boolean(subscribed) : undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/contacts/:id
 * Delete contact with workspace isolation
 */
async function remove(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Contact not found or access denied.');
    }

    await prisma.contact.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Contact removed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/contacts/import
 * Bulk import subscriber contacts from CSV rows
 */
async function importContacts(req, res, next) {
  try {
    ensureDbConnected();
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ApiError(400, 'rows array is required and must not be empty.');
    }

    const workspaceId = await getUserWorkspaceId(req.user.id);

    // Fetch existing emails in workspace for duplicate skipping
    const existingContacts = await prisma.contact.findMany({
      where: { workspaceId },
    });
    const existingEmails = new Set(
      existingContacts
        .map((c) => (c && c.email ? c.email.toLowerCase().trim() : ''))
        .filter(Boolean)
    );

    const created = [];
    const skipped = [];
    const failed = [];

    for (const r of rows) {
      if (!r || !r.email || typeof r.email !== 'string') {
        failed.push({ row: r, reason: 'Missing or invalid email' });
        continue;
      }

      const emailLower = r.email.toLowerCase().trim();

      if (existingEmails.has(emailLower)) {
        skipped.push({ email: emailLower, reason: 'Duplicate email' });
        continue;
      }

      const parsedTags = Array.isArray(r.tags)
        ? r.tags
        : typeof r.tags === 'string'
        ? r.tags.split(';').map((t) => t.trim()).filter(Boolean)
        : ['Imported'];

      try {
        const contact = await prisma.contact.create({
          data: {
            workspaceId,
            email: emailLower,
            name: r.name ? r.name.trim() : emailLower.split('@')[0],
            tags: parsedTags,
            subscribed: true,
            source: 'csv_import',
          },
        });

        existingEmails.add(emailLower);
        created.push(contact);
      } catch (e) {
        failed.push({ email: emailLower, reason: e.message });
      }
    }

    res.json({
      total: rows.length,
      importedCount: created.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      imported: created,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove, importContacts };
