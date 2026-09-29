/**
 * VISTA Database Backup & Integrity Check Utility
 * Takes timestamped snapshots of server/data/vista_db.json
 */

import fs from 'fs';
import path from 'path';

function runBackup() {
  const dbPath = path.resolve('server', 'data', 'vista_db.json');
  const backupDir = path.resolve('server', 'data', 'backups');

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Source database file not found at: ${dbPath}`);
    process.exit(1);
  }

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Read and validate JSON integrity
  const rawData = fs.readFileSync(dbPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch (err: any) {
    console.error(`❌ Corrupted JSON database: ${err.message}`);
    process.exit(1);
  }

  // Generate timestamped filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetFile = path.join(backupDir, `vista_db_${timestamp}.json`);

  fs.writeFileSync(targetFile, JSON.stringify(parsed, null, 2), 'utf8');

  console.log(`✅ Database verified and backed up successfully!`);
  console.log(`📁 Source: ${dbPath}`);
  console.log(`💾 Backup: ${targetFile}`);
  console.log(`📊 Records backed up: ${Object.keys(parsed).length} top-level nodes`);
}

runBackup();
