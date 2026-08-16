const { sequelize } = require('../server/db/sequelize');

async function nukeAndPave() {
  try {
    console.log('☢️ STARTING NUCLEAR RESET...');
    
    // 1. Wipe Database
    console.log('🧹 Wiping database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database wiped and recreated.');

    console.log('\n🚀 RESET COMPLETE.');
    console.log('--------------------------------------------------');
    console.log('NEXT STEPS:');
    console.log('1. Kill all existing node processes (Stop-Process -Name node -Force)');
    console.log('2. Start your Backend Server');
    console.log('3. Start your Frontend');
    console.log('4. Start the Producer (node producer/producer.js)');
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Nuclear Reset Failed:', error);
    process.exit(1);
  }
}

nukeAndPave();
