const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Ruta para obtener todas las listas de compras
app.get('/lists', (req, res) => {
    db.all(`SELECT * FROM lists`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ lists: rows });
    });
});

// Ruta para crear una nueva lista de compras
app.post('/lists', (req, res) => {
    const { name, date, status } = req.body;
    db.run(`INSERT INTO lists (name, date, status) VALUES (?, ?, ?)`, [name, date, status], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Ruta para obtener todos los elementos de una lista específica
app.get('/items/:list_id', (req, res) => {
    const list_id = req.params.list_id;
    db.all(`SELECT * FROM items WHERE list_id = ?`, [list_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
});

// Ruta para obtener todos los elementos de todas las listas (para la Alacena)
app.get('/items', (req, res) => {
    db.all(`SELECT * FROM items`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
});

// Ruta para crear un nuevo elemento en una lista específica
app.post('/items', (req, res) => {
    const { list_id, name, quantity, purchase_date, expiry_date } = req.body;
    db.run(`INSERT INTO items (list_id, name, quantity, purchase_date, expiry_date) VALUES (?, ?, ?, ?, ?)`,
        [list_id, name, quantity, purchase_date, expiry_date], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

// Ruta para actualizar el estado de una lista de compras
app.post('/lists', (req, res) => {
    const { name, date, status } = req.body;
    db.run(`UPDATE lists SET date = ?, status = ? WHERE name = ?`, [date, status, name], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Inicializar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
