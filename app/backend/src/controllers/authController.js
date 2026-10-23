const crypto = require('crypto');
const { query } = require('../config/db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function register(req, res, next) {
  try {
    const { username, password, email } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be at least 3 characters long.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 4 characters long.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanUsername}@example.com`;

    // Check if username already exists
    const existing = await query('SELECT id FROM users WHERE username = $1', [cleanUsername]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken. Please choose another one or log in.',
      });
    }

    // Hash password and insert
    const passwordHash = hashPassword(password);
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [cleanUsername, cleanEmail, passwordHash]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const passwordHash = hashPassword(password);

    // Look up user
    const result = await query(
      'SELECT id, username, email, password_hash FROM users WHERE username = $1',
      [cleanUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const user = result.rows[0];

    if (user.password_hash !== passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  hashPassword,
};
