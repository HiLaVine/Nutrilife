const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Para desarrollo, puedes usar ':memory:'. Para producción, usa un archivo.

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        date TEXT,
        status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER,
        name TEXT,
        quantity TEXT,
        purchase_date TEXT,
        expiry_date TEXT,
        FOREIGN KEY (list_id) REFERENCES lists(id)
    )`);

    // Tabla de recetas
    db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        instructions TEXT
    )`);

    // Tabla de ingredientes de recetas
    db.run(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        ingredient TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    )`);
});

module.exports = db;
