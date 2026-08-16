require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || 'sk123',
    name: process.env.DB_NAME || 'nexus_db',
  },
};
