const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('banco.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS livros (
            id TEXT PRIMARY KEY,
            titulo TEXT,
            autor TEXT,
            genero TEXT,
            imagem TEXT,
            copiasDisponiveis INTEGER
        )
    `);
});

const getLivros = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM livros', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

const getLivroById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM livros WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

const adicionarLivro = (livro) => {
    return new Promise((resolve, reject) => {
        const { id, titulo, autor, genero, imagem, copiasDisponiveis } = livro;
        db.run(
            'INSERT INTO livros (id, titulo, autor, genero, imagem, copiasDisponiveis) VALUES (?, ?, ?, ?, ?, ?)',
            [id, titulo, autor, genero, imagem, copiasDisponiveis],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ id, titulo, autor, genero, imagem, copiasDisponiveis });
            }
        );
    });
};

const comprarLivro = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM livros WHERE id = ?', [id], (err, livro) => {
            if (err) {
                reject(err);
                return;
            }
            if (!livro) {
                reject(new Error('Livro não encontrado'));
                return;
            }
            if (livro.copiasDisponiveis > 0) {
                const novasCopiasDisponiveis = livro.copiasDisponiveis - 1;
                db.run(
                    'UPDATE livros SET copiasDisponiveis = ? WHERE id = ?',
                    [novasCopiasDisponiveis, id],
                    function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({ message: 'Livro comprado com sucesso!', livro });
                    }
                );
            } else {
                reject(new Error('Livro fora de estoque'));
            }
        });
    });
};

module.exports = {
    getLivros,
    getLivroById,
    adicionarLivro,
    comprarLivro
};
