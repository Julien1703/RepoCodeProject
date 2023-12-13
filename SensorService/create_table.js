const sqlite3 = require('sqlite3').verbose();

// Funktion zum Erstellen der Tabellen
function createTables(db) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS temperature_data (
      id TEXT PRIMARY KEY,
      temperature REAL,
      mac TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// Export der Funktion
module.exports = createTables;
