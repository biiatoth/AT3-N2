const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const dbPath = path.resolve(__dirname, 'livros.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        db.run(`CREATE TABLE IF NOT EXISTS livros (
            id TEXT PRIMARY KEY,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            genero TEXT NOT NULL,
            imagem TEXT,
            copias_disponiveis INTEGER NOT NULL
        )`);
    }
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Servidor da livraria está funcionando corretamente.');
});

app.get('/livros', (req, res) => {
    const sql = `SELECT * FROM livros`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao listar livros', err.message);
            res.status(500).json({ error: 'Erro interno ao buscar livros' });
        } else {
            res.json(rows);
        }
    });
});

app.post('/livros', (req, res) => {
    const { titulo, autor, genero, imagem, copiasDisponiveis } = req.body;
    const id = uuidv4();
    const sql = `INSERT INTO livros (id, titulo, autor, genero, imagem, copias_disponiveis)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [id, titulo, autor, genero, imagem, copiasDisponiveis];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Erro ao adicionar livro', err.message);
            res.status(500).json({ error: 'Erro interno ao adicionar livro' });
        } else {
            console.log(`Livro adicionado com ID: ${id}`);
            res.status(201).json({ id, titulo, autor, genero, imagem, copiasDisponiveis });
        }
    });
});

app.post('/livros/:id/comprar', (req, res) => {
    const { id } = req.params;
    const sqlSelect = `SELECT * FROM livros WHERE id = ?`;
    const sqlUpdate = `UPDATE livros SET copias_disponiveis = ? WHERE id = ?`;

    db.get(sqlSelect, [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar livro para compra', err.message);
            res.status(500).json({ error: 'Erro interno ao buscar livro' });
        } else {
            if (!row) {
                res.status(404).json({ message: 'Livro não encontrado' });
            } else {
                if (row.copias_disponiveis > 0) {
                    const novasCopias = row.copias_disponiveis - 1;
                    db.run(sqlUpdate, [novasCopias, id], (err) => {
                        if (err) {
                            console.error('Erro ao atualizar copias disponiveis', err.message);
                            res.status(500).json({ error: 'Erro interno ao comprar livro' });
                        } else {
                            res.json({ message: 'Livro comprado com sucesso!', livro: { ...row, copias_disponiveis: novasCopias } });
                        }
                    });
                } else {
                    res.status(400).json({ message: 'Livro fora de estoque' });
                }
            }
        }
    });
});

app.put('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, genero, imagem, copiasDisponiveis } = req.body;
    const sqlUpdate = `UPDATE livros
                       SET titulo = ?, autor = ?, genero = ?, imagem = ?, copias_disponiveis = ?
                       WHERE id = ?`;
    const params = [titulo, autor, genero, imagem, copiasDisponiveis, id];

    db.run(sqlUpdate, params, function(err) {
        if (err) {
            console.error('Erro ao atualizar livro', err.message);
            res.status(500).json({ error: 'Erro interno ao atualizar livro' });
        } else {
            console.log(`Livro atualizado com ID: ${id}`);
            res.json({ id, titulo, autor, genero, imagem, copiasDisponiveis });
        }
    });
});

app.get('/livros/buscar', (req, res) => {
    const { titulo } = req.query;
    const sql = `SELECT * FROM livros WHERE titulo LIKE ?`;
    const params = [`%${titulo}%`];

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar livro', err.message);
            res.status(500).json({ error: 'Erro interno ao buscar livro' });
        } else {
            res.json(rows);
        }
    });
});

app.delete('/livros/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM livros WHERE id = ?`;

    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Erro ao remover livro', err.message);
            res.status(500).json({ error: 'Erro interno ao remover livro' });
        } else {
            console.log(`Livro removido com ID: ${id}`);
            res.json({ message: 'Livro removido com sucesso' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
