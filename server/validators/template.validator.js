// Template Schemas — MailPilot

const { z } = require('zod');

const createTemplateSchema = z.object({
  title: z.string().min(1, 'Template title is required').max(150),
  subject: z.string().max(255).optional().nullable(),
  body: z.string().min(1, 'Template body is required').max(100000),
  htmlBody: z.string().max(100000).optional().nullable(),
  category: z.string().max(50).optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
};
