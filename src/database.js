const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

function create_table() {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS Threads (id INTEGER PRIMARY KEY AUTOINCREMENT, size INTEGER, has_threads BOOLEAN, count_threads INTEGER, runtime FLOAT)');
    });
}

function insert_values(values) {
    const { size, has_threads, count_threads, runtime } = values;
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Threads (size, has_threads, count_threads, runtime) VALUES (?, ?, ?, ?)`,
            [size, has_threads, count_threads, runtime],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

function get_values() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Threads', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

create_table();

module.exports = { insert_values, get_values };
