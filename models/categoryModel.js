const pool = require('../config/db');

async function all() {
  const { rows } = await pool.query('SELECT * FROM categorias ORDER BY orden ASC, id ASC');
  return rows;
}

async function allActive() {
  const { rows } = await pool.query(
    'SELECT * FROM categorias WHERE activo = true ORDER BY orden ASC, id ASC'
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
  return rows[0] || null;
}

async function nextOrder() {
  const { rows } = await pool.query(
    'SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM categorias'
  );
  return rows[0].siguiente;
}

async function create(data) {
  const orden = await nextOrder();
  const { rows } = await pool.query(
    `INSERT INTO categorias (nombre, descripcion, orden)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.nombre, data.descripcion, orden]
  );
  return rows[0];
}

async function update(id, data) {
  const { rows } = await pool.query(
    `UPDATE categorias
        SET nombre = $1, descripcion = $2, actualizado_en = now()
      WHERE id = $3
      RETURNING *`,
    [data.nombre, data.descripcion, id]
  );
  return rows[0] || null;
}

async function toggleActivo(id) {
  const { rows } = await pool.query(
    `UPDATE categorias
        SET activo = NOT activo, actualizado_en = now()
      WHERE id = $1
      RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function move(id, direction) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT id, orden FROM categorias WHERE id = $1', [id]);
    const current = rows[0];

    if (!current) {
      await client.query('ROLLBACK');
      return false;
    }

    const comparison = direction === 'up' ? '<' : '>';
    const sort = direction === 'up' ? 'DESC' : 'ASC';
    const neighborResult = await client.query(
      `SELECT id, orden FROM categorias
        WHERE orden ${comparison} $1
        ORDER BY orden ${sort}
        LIMIT 1`,
      [current.orden]
    );
    const neighbor = neighborResult.rows[0];

    if (!neighbor) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query('UPDATE categorias SET orden = $1 WHERE id = $2', [
      neighbor.orden,
      current.id,
    ]);
    await client.query('UPDATE categorias SET orden = $1 WHERE id = $2', [
      current.orden,
      neighbor.id,
    ]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function count() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM categorias');
  return rows[0].total;
}

module.exports = {
  all,
  allActive,
  findById,
  create,
  update,
  toggleActivo,
  move,
  count,
};
