const pool = require('../config/db');

async function findByUsername(username) {
  const { rows } = await pool.query(
    'SELECT * FROM usuarios_admin WHERE username = $1 AND activo = true',
    [username]
  );
  return rows[0] || null;
}

module.exports = { findByUsername };
