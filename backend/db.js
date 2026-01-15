//databse
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data.db');
const MIGRATION = path.join(__dirname, 'migrations', '001-create-users.sql');

const db = new sqlite3.Database(DB_PATH);

function runMigration() {
    const sql = fs.readFileSync(MIGRATION, 'utf8');
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id,name,email,phone,password_hash,is_verified,created_at FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function createUser({name, email, phone, password_hash}) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)');
        stmt.run([name, email, phone, password_hash], function(err) {
            if (err) return reject(err);
            resolve({id: this.lastID});
        });
    });
}

// module.exports = { db, runMigration, getUserByEmail, createUser };

// database (дополнение)

// Найти пользователя по id
function getUserById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id,name,email,phone,password_hash,is_verified,created_at FROM users WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// Обновить пользователя по id. fields — объекты с полями для обновления (name,email,phone,password_hash)
function updateUserById(id, fields) {
    return new Promise((resolve, reject) => {
        const sets = [];
        const params = [];
        if (fields.name !== undefined) { sets.push('name = ?'); params.push(fields.name); }
        if (fields.email !== undefined) { sets.push('email = ?'); params.push(fields.email); }
        if (fields.phone !== undefined) { sets.push('phone = ?'); params.push(fields.phone); }
        if (fields.password_hash !== undefined) { sets.push('password_hash = ?'); params.push(fields.   password_hash); }
        if (sets.length === 0) return resolve({ changes: 0 });

        params.push(id);
        const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = ?`;
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({ changes: this.changes });
        });
    });
}

module.exports = { db, runMigration, getUserByEmail, createUser, getUserById, updateUserById };
