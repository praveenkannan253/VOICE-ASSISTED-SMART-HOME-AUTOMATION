require('dotenv').config();
const { pool } = require('./db');

async function migrateFridgeTable() {
  try {
    console.log('🔄 Starting fridge_items table migration...');
    console.log(`📊 Database: ${process.env.MYSQL_DATABASE || 'smarthome'}`);

    // Check if image_path column exists
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'fridge_items' AND COLUMN_NAME = 'image_path'"
    );

    if (columns.length === 0) {
      console.log('➕ Adding image_path column...');
      await pool.execute(
        'ALTER TABLE fridge_items ADD COLUMN image_path VARCHAR(255) AFTER status'
      );
      console.log('✅ Added image_path column');
    } else {
      console.log('✅ image_path column already exists');
    }

    // Check if image_url column exists
    const [columns2] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'fridge_items' AND COLUMN_NAME = 'image_url'"
    );

    if (columns2.length === 0) {
      console.log('➕ Adding image_url column...');
      await pool.execute(
        'ALTER TABLE fridge_items ADD COLUMN image_url VARCHAR(255) AFTER image_path'
      );
      console.log('✅ Added image_url column');
    } else {
      console.log('✅ image_url column already exists');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrateFridgeTable();
