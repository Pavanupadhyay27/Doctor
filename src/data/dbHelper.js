import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export function getDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      // Create empty DB template if missing
      const initialDb = { leads: [], patients: [], appointments: [], templates: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { leads: [], patients: [], appointments: [], templates: [] };
  }
}

export function saveDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}
