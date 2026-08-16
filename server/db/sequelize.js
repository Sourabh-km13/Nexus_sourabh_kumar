const { Sequelize } = require('sequelize');
const config = require('../../config/config.json');
require('dotenv').config();

const dbConfig = config.development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false,
});

// Database Sync Helper
const syncDb = async () => {
  try {
    const force = process.env.DB_SYNC === 'force';
    console.log(`Syncing database (force: ${force})...`);
    await sequelize.sync({ force });
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    throw error;
  }
};

module.exports = { sequelize, syncDb };
