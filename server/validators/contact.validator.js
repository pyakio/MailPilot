// Contact Schemas — MailPilot

const { z } = require('zod');

const createContactSchema = z.object({
  email: z.string().email('Please provide a valid email address').max(255),
  name: z.string().max(100).optional().nullable(),
  tags: z.union([z.array(z.string().max(50)), z.string()]).optional(),
});

const updateContactSchema = z.object({
  email: z.string().email('Please provide a valid email address').max(255).optional(),
  name: z.string().max(100).optional().nullable(),
  tags: z.union([z.array(z.string().max(50)), z.string()]).optional(),
  subscribed: z.boolean().optional(),
});

const importContactsSchema = z.object({
  rows: z.array(
    z.object({
      email: z.string().email('Invalid email in import row'),
      name: z.string().optional().nullable(),
      tags: z.union([z.array(z.string()), z.string()]).optional(),
    })
  ).min(1, 'Rows array cannot be empty'),
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  importContactsSchema,
};
