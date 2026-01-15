// server.js
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { runMigration, getUserByEmail, createUser } = require('./db');
const cookieSession = require('cookie-session');
const cors = require('cors');


const PORT = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_KEY || 'dev_key_change_me'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Serve static frontend
app.use('/', express.static(path.join(__dirname, 'public')));

// Run migration on start
runMigration().then(() => {
    console.log('Migrations applied');
}).catch(err => {
    console.error('Migration error', err);
});

// API: check if email exists (проверка существует ли Email)
app.get('/api/users/check', async (req, res) => {
    try {
        const email = (req.query.email || '').trim().toLowerCase();
        if (!email) return res.status(400).json({ error: 'email required' });

        const user = await getUserByEmail(email);
        return res.json({ exists: !!user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
});

// API: register (регистрация)
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'name,email,password required' });

        const normEmail = String(email).trim().toLowerCase();
        const existing = await getUserByEmail(normEmail);
        if (existing) return res.status(409).json({ error: 'User already exists' });

// Password policy: min 8 chars
        if (String(password).length < 8) return res.status(400).json({ error: 'Password too short' });

        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        const created = await createUser({ name, email: normEmail, phone, password_hash: hash });

// Optionally: send verification email (not implemented here)
        return res.status(201).json({ message: 'Registered', id: created.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
});

// API: login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email,password required' });

        const normEmail = String(email).trim().toLowerCase();
        const user = await getUserByEmail(normEmail);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

// Save minimal session
        req.session = { userId: user.id, name: user.name, email: user.email };
        return res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
});

// API: get current user
app.get('/api/me', (req, res) => {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ user: { id: req.session.userId, name: req.session.name, email: req.session.email } });
});

// API: logout
app.post('/api/logout', (req, res) => {
    req.session = null;
    res.json({ message: 'Logged out' });
});

// === Дополнение для обновления профиля пользователей ===
// middleware: ensure authenticated
function ensureAuth(req, res, next){
    if(!req.session || !req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    next();
}

app.patch('/api/me', ensureAuth, async (req, res) => {
        try {
            const userId = req.session.userId;
            const { name, email, phone, currentPassword, newPassword } = req.body;

// 1) Валидация базовая
            if(name && String(name).length > 150) return res.status(400).json({ error: 'Name too long' });
            if(email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
            if(phone && String(phone).length > 30) return res.status(400).json({ error: 'Invalid phone' });

// 2) Получаем пользователя по id
        const getUserById = (id) => new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if(err) return reject(err);
                resolve(row);
            });
        });
        const user = await getUserById(userId);
        if(!user) return res.status(404).json({ error: 'User not found' });

// 3) Если email меняется — проверяем уникальность
        if(email && email.toLowerCase() !== user.email) {
            const existing = await getUserByEmail(email.toLowerCase());
            if(existing) return res.status(409).json({ error: 'Email already in use' });
        }

// 4) Если меняем пароль — проверка currentPassword и хеширование нового
        let newHash = null;
        if(newPassword) {
            if(!currentPassword) return res.status(400).json({ error: 'Current password required to set new password' });
            const ok = await bcrypt.compare(currentPassword, user.password_hash);
            if(!ok) return res.status(401).json({ error: 'Current password is incorrect' });
            if(String(newPassword).length < 8) return res.status(400).json({ error: 'New password too short' });
            newHash = await bcrypt.hash(newPassword, 12);
        }

// 5) Выполняем UPDATE (с подготовленным запросом)
        const fields = [], params = [];
            if(name) { fields.push('name = ?'); params.push(name); }
            if(email) { fields.push('email = ?'); params.push(email.toLowerCase()); }
            if(phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
            if(newHash) { fields.push('password_hash = ?'); params.push(newHash); }
            if(fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });

        params.push(userId); // for WHERE
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        db.run(sql, params, function(err){
            if(err) { console.error(err); return res.status(500).json({ error: 'DB error' }); }
          // Обновляем сессию email/name если поменяны
            if(email) { req.session.email = email.toLowerCase(); }
            if(name) { req.session.name = name; }
            return res.json({
                message: 'Profile updated',
                user: {
                    id: userId,
                    name: name || user.name,
                    email: email ? email.toLowerCase() : user.email,
                    phone: phone !== undefined ? phone : user.phone
                }
            });
        });

    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Проверка аутентификации для защищённых роутов
function ensureAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

/**
 * PATCH /api/me
 * Тело: { name?, email?, phone?, currentPassword?, newPassword? }
 * Поведение:
 *  - валидация полей
 *  - если меняется email — проверка уникальности
 *  - если меняется пароль — требуется currentPassword, сравнение с хешем, хеширование нового пароля
 *  - обновление записи, обновление сессии (email/name)
 */
app.patch('/api/me', ensureAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone, currentPassword, newPassword } = req.body;

    // Базовая валидация
    if (name && String(name).length > 150) return res.status(400).json({ error: 'Name too long' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (phone && String(phone).length > 30) return res.status(400).json({ error: 'Invalid phone' });

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Проверка уникальности email, если он меняется
    let normEmail = undefined;
    if (email) {
      normEmail = String(email).trim().toLowerCase();
      if (normEmail !== user.email) {
        const existing = await getUserByEmail(normEmail);
        if (existing) return res.status(409).json({ error: 'Email already in use' });
      } else {
        normEmail = undefined; // фактически не меняется
      }
    }

    // Обработка смены пароля
    let newHash = undefined;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to set new password' });
      const ok = await bcrypt.compare(currentPassword, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
      if (String(newPassword).length < 8) return res.status(400).json({ error: 'New password too short' });
      newHash = await bcrypt.hash(newPassword, 12);
    }

    // Подготовка полей для обновления
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (normEmail !== undefined) fieldsToUpdate.email = normEmail;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (newHash !== undefined) fieldsToUpdate.password_hash = newHash;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    // Выполняем обновление
    await updateUserById(userId, fieldsToUpdate);

    // Обновляем сессию (если поменяли email/name)
    if (fieldsToUpdate.email) req.session.email = fieldsToUpdate.email;
    if (fieldsToUpdate.name) req.session.name = fieldsToUpdate.name;

    // Возвращаем свежие данные
    const updated = await getUserById(userId);
    return res.json({
      message: 'Profile updated',
      user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone }
    });
  } catch (err) {
    console.error('PATCH /api/me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});