// Workspace Service — MailPilot
// Manages multi-tenant workspace isolation and user membership bootstrapping

const { prisma } = require('../config/db');

/**
 * Resolves or creates a default Workspace and Membership for a user.
 * Ensures strict multi-tenant SaaS isolation.
 */
async function getOrCreateUserWorkspace(userId, userName) {
  // Return existing membership workspace if present
  const existingMembership = await prisma.workspaceMembership.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (existingMembership) {
    return existingMembership.workspace;
  }

  // Generate clean unique workspace slug
  const cleanName = (userName || 'Default').trim();
  const slug = `ws-${userId.slice(-8)}-${Date.now().toString(36)}`;

  // Create Workspace and Membership in a transaction
  const workspace = await prisma.workspace.create({
    data: {
      name: `${cleanName}'s Workspace`,
      slug,
      memberships: {
        create: {
          userId,
          role: 'ADMIN',
        },
      },
    },
  });

  return workspace;
}

/**
 * Gets the active workspaceId for an authenticated user.
 */
async function getUserWorkspaceId(userId) {
  const membership = await prisma.workspaceMembership.findFirst({
    where: { userId },
    select: { workspaceId: true },
  });

  if (membership) {
    return membership.workspaceId;
  }

  // Fall back to bootstrapping workspace
  const workspace = await getOrCreateUserWorkspace(userId, 'User');
  return workspace.id;
}

module.exports = {
  getOrCreateUserWorkspace,
  getUserWorkspaceId,
};
