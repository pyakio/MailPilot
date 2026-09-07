// Analytics Controller — MailPilot
// Aggregates real workspace campaign telemetry and subscriber metrics via Prisma ORM

const { getConnectionStatus, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getUserWorkspaceId } = require('../services/workspace.service');

/**
 * Classifies a User-Agent string into a readable email client bucket.
 */
function classifyUserAgent(ua) {
  if (!ua) return 'Other';
  const s = ua.toLowerCase();
  if (s.includes('iphone') || s.includes('ipad') || (s.includes('apple') && s.includes('mobile'))) return 'Apple Mail (iOS)';
  if (s.includes('applemail') || s.includes('darwin') || s.includes('macintosh')) return 'Apple Mail (Desktop)';
  if (s.includes('gmail') || s.includes('googleimageproxy')) return 'Gmail';
  if (s.includes('outlook')) return 'Outlook';
  if (s.includes('android')) return 'Android Mail';
  if (s.includes('thunderbird')) return 'Thunderbird';
  return 'Other';
}

async function getAnalytics(req, res, next) {
  try {
    if (!getConnectionStatus()) {
      throw new ApiError(503, 'Database connection unavailable.');
    }

    const workspaceId = await getUserWorkspaceId(req.user.id);

    const [totalCampaigns, totalContacts, campaigns, recentEvents] = await Promise.all([
      prisma.campaign.count({ where: { workspaceId } }),
      prisma.contact.count({ where: { workspaceId, subscribed: true } }),
      prisma.campaign.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          status: true,
          stats: true,
          createdAt: true,
          sentAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailEvent.findMany({
        where: { workspaceId },
        select: {
          eventType: true,
          createdAt: true,
          metadata: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 2000,
      }),
    ]);

    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalUnsubscribed = 0;

    const perCampaign = campaigns.map((c) => {
      const stats = typeof c.stats === 'object' && c.stats ? c.stats : {};
      const sent = typeof stats.sent === 'number' ? stats.sent : 0;
      const delivered = typeof stats.delivered === 'number' ? stats.delivered : sent;
      const opened = typeof stats.opened === 'number' ? stats.opened : 0;
      const clicked = typeof stats.clicked === 'number' ? stats.clicked : 0;
      const bounced = typeof stats.bounced === 'number' ? stats.bounced : 0;
      const unsubscribed = typeof stats.unsubscribed === 'number' ? stats.unsubscribed : 0;

      totalSent += sent;
      totalDelivered += delivered;
      totalOpened += opened;
      totalClicked += clicked;
      totalBounced += bounced;
      totalUnsubscribed += unsubscribed;

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        unsubscribed,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 1000) / 10 : 0,
        clickRate: delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0,
        sentAt: c.sentAt || c.createdAt,
      };
    });

    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 1000) / 10 : 0;
    const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 1000) / 10 : 0;
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 1000) / 10 : 0;

    // Build 7-day time-series data for engagement over time and open trends
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const openTrend = [];
    const engagementTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dateLabel = `${months[d.getMonth()]} ${d.getDate()}`;

      const dayEvents = recentEvents.filter((e) => {
        const evDate = new Date(e.createdAt);
        return (
          evDate.getDate() === d.getDate() &&
          evDate.getMonth() === d.getMonth() &&
          evDate.getFullYear() === d.getFullYear()
        );
      });

      const daySent = dayEvents.filter((e) => e.eventType === 'SENT').length;
      const dayOpens = dayEvents.filter((e) => e.eventType === 'OPENED').length;
      const dayClicks = dayEvents.filter((e) => e.eventType === 'CLICKED').length;
      const dayOpenPercent = daySent > 0 ? Math.round((dayOpens / daySent) * 100) : (dayOpens > 0 ? 100 : 0);

      openTrend.push({
        day: dayLabel,
        date: dateLabel,
        opens: dayOpenPercent,
        sentCount: daySent,
        openCount: dayOpens,
      });

      engagementTrend.push({
        day: dayLabel,
        date: dateLabel,
        Opens: dayOpens,
        Clicks: dayClicks,
        Sent: daySent,
      });
    }

    const deliveryBreakdown = [
      { name: 'Sent', count: totalSent, fill: '#3E6B70' },
      { name: 'Delivered', count: totalDelivered, fill: '#6B7280' },
      { name: 'Opened', count: totalOpened, fill: '#E8A33D' },
      { name: 'Clicked', count: totalClicked, fill: '#22C55E' },
      { name: 'Bounced', count: totalBounced, fill: '#EF4444' },
    ];

    // --- Real Device/Client Share from EmailEvent metadata User-Agent ---
    const openEvents = recentEvents.filter((e) => e.eventType === 'OPENED');
    const clientCounts = {};
    for (const ev of openEvents) {
      const ua = ev.metadata?.userAgent || ev.metadata?.ua || '';
      const client = classifyUserAgent(ua);
      clientCounts[client] = (clientCounts[client] || 0) + 1;
    }

    const CLIENT_COLORS = {
      'Apple Mail (iOS)': '#E8A33D',
      'Apple Mail (Desktop)': '#F59E0B',
      Gmail: '#3E6B70',
      Outlook: '#22C55E',
      'Android Mail': '#6366F1',
      Thunderbird: '#8B5CF6',
      Other: '#6B7280',
    };

    const totalOpenEvents = openEvents.length;
    const deviceShare = Object.entries(clientCounts).map(([name, count]) => ({
      name,
      value: totalOpenEvents > 0 ? Math.round((count / totalOpenEvents) * 100) : 0,
      color: CLIENT_COLORS[name] || '#6B7280',
    }));

    // --- Real Hourly Trend: 24-hour bucket aggregation from EmailEvent timestamps ---
    const hourlyCounts = {};
    for (const ev of openEvents) {
      const hour = new Date(ev.createdAt).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }

    const hourlyTrend = [];
    for (let h = 0; h < 24; h += 2) {
      const label = `${String(h).padStart(2, '0')}:00`;
      hourlyTrend.push({ hour: label, opens: (hourlyCounts[h] || 0) + (hourlyCounts[h + 1] || 0) });
    }

    res.json({
      totalCampaigns,
      totalContacts,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      openRate,
      clickRate,
      bounceRate,
      perCampaign,
      openTrend,
      engagementTrend,
      deliveryBreakdown,
      deviceShare,
      hourlyTrend,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
