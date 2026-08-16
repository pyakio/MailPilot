// Campaign Schemas — MailPilot

const { z } = require('zod');

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(150),
  subject: z.string().min(1, 'Subject line is required').max(255),
  previewText: z.string().max(255).optional().nullable(),
  content: z.string().max(100000).optional().nullable(),
  templateId: z.string().optional().nullable(),
  audienceList: z.string().max(100).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable().or(z.string().optional().nullable()),
  tags: z.array(z.string().max(50)).optional(),
});

const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED']).optional(),
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
};
