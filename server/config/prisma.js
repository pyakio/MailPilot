// Prisma Client Singleton & In-Memory Store Proxy for MailPilot API Server
// Connects to PostgreSQL database hosted on Supabase when connected,
// or proxies to in-memory store in local development/test mode.

const { PrismaClient } = require('@prisma/client');
const { inMemoryStore } = require('./inMemoryStore');
const { NODE_ENV } = require('./env');

let rawPrisma = null;
try {
  rawPrisma = new PrismaClient({
    log: NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (e) {
  // PrismaClient instantiation error
}

let isDbLive = false;

function setDbLiveStatus(status) {
  isDbLive = Boolean(status);
}

function getDbLiveStatus() {
  return isDbLive;
}

// Proxy that routes to real PrismaClient if connected, otherwise to inMemoryStore
const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'setDbLiveStatus') {
      return setDbLiveStatus;
    }
    if (prop === 'getDbLiveStatus') {
      return getDbLiveStatus;
    }
    if (prop === '$connect') {
      return async () => {
        if (rawPrisma) return rawPrisma.$connect();
        return Promise.resolve();
      };
    }
    if (prop === '$disconnect') {
      return async () => {
        if (rawPrisma) return rawPrisma.$disconnect();
        return Promise.resolve();
      };
    }
    if (prop === '$queryRaw') {
      return async (...args) => {
        if (rawPrisma && isDbLive) return rawPrisma.$queryRaw(...args);
        return [{ '?column?': 1 }];
      };
    }
    if (prop === '__isMemoryStore') {
      return !isDbLive;
    }
    if (prop === '__store') {
      return inMemoryStore;
    }

    if (isDbLive && rawPrisma && rawPrisma[prop]) {
      return rawPrisma[prop];
    }

    if (inMemoryStore[prop]) {
      return inMemoryStore[prop];
    }

    return rawPrisma ? rawPrisma[prop] : undefined;
  },
});

module.exports = prisma;
module.exports.setDbLiveStatus = setDbLiveStatus;
module.exports.getDbLiveStatus = getDbLiveStatus;
module.exports.inMemoryStore = inMemoryStore;
