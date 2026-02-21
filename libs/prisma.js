const {PrismaPg} = require('@prisma/adapter-pg');
const {PrismaClient} = require('@prisma/client');
const config = require('../config');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || config.database.url,
});

const prisma = new PrismaClient({adapter});

module.exports = prisma;
