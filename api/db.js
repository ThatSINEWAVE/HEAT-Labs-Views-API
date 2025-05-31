import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'tracker-data.json');

// Initialize database file if it doesn't exist
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch (err) {
    await fs.writeFile(DB_PATH, JSON.stringify({}));
  }
}

// Read the database
async function readDB() {
  await initDB();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Write to the database
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Record a view for a specific image
export async function recordView(imageName) {
  const today = new Date().toISOString().split('T')[0];
  const db = await readDB();

  // Initialize image entry if it doesn't exist
  if (!db[imageName]) {
    db[imageName] = {
      totalViews: 0,
      dailyViews: {}
    };
  }

  // Update total views
  db[imageName].totalViews += 1;

  // Update daily views
  if (!db[imageName].dailyViews[today]) {
    db[imageName].dailyViews[today] = 0;
  }
  db[imageName].dailyViews[today] += 1;

  await writeDB(db);
}

// Get statistics for all images
export async function getAllStats() {
  const db = await readDB();
  return db;
}

// Get statistics for a specific image
export async function getImageStats(imageName) {
  const db = await readDB();
  return db[imageName] || null;
}

// Get daily statistics for all images
export async function getDailyStats() {
  const db = await readDB();
  return db;
}