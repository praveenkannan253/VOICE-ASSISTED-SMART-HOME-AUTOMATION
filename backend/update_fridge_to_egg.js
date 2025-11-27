// Quick script to update fridge items from Milk to Egg
const mysql = require('mysql2/promise');

async function updateFridgeItems() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'smarthome',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Update existing Milk entry to Egg
    console.log('📝 Updating Milk to Egg...');
    const [result1] = await pool.execute(
      'UPDATE fridge_items SET item = ?, quantity = ? WHERE item = ?',
      ['Egg', 12, 'Milk']
    );
    console.log(`✅ Updated ${result1.affectedRows} rows`);

    // Insert Egg if it doesn't exist
    console.log('➕ Ensuring Egg exists...');
    const [result2] = await pool.execute(
      'INSERT INTO fridge_items (item, quantity, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?',
      ['Egg', 12, 'ok', 12]
    );
    console.log(`✅ Ensured Egg exists`);

    // Verify
    console.log('\n📋 Current fridge items:');
    const [rows] = await pool.execute('SELECT * FROM fridge_items ORDER BY id');
    rows.forEach(row => {
      console.log(`   • ${row.item}: ${row.quantity} (${row.status})`);
    });

    console.log('\n✅ Database updated successfully!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateFridgeItems();
