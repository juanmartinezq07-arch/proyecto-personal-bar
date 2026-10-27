const pool = require('../config/db');

async function allWithCategory() {
  const { rows } = await pool.query(
    `SELECT p.*, c.nombre AS categoria_nombre
       FROM productos p
       JOIN categorias c ON c.id = p.categoria_id
      ORDER BY c.orden ASC, p.orden ASC, p.id ASC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  return rows[0] || null;
}

async function nextOrder(categoriaId) {
  const { rows } = await pool.query(
    'SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM productos WHERE categoria_id = $1',
    [categoriaId]
  );
  return rows[0].siguiente;
}

async function create(data) {
  const orden = await nextOrder(data.categoria_id);
  const { rows } = await pool.query(
    `INSERT INTO productos
       (categoria_id, nombre, descripcion, precio, disponible, visible, imagen_path, orden)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.categoria_id,
      data.nombre,
      data.descripcion,
      data.precio,
      data.disponible,
      data.visible,
      data.imagen_path,
      orden,
    ]
  );
  return rows[0];
}

async function update(id, data) {
  const { rows } = await pool.query(
    `UPDATE productos
        SET categoria_id = $1,
            nombre = $2,
            descripcion = $3,
            precio = $4,
            disponible = $5,
            visible = $6,
            imagen_path = $7,
            actualizado_en = now()
      WHERE id = $8
      RETURNING *`,
    [
      data.categoria_id,
      data.nombre,
      data.descripcion,
      data.precio,
      data.disponible,
      data.visible,
      data.imagen_path,
      id,
    ]
  );
  return rows[0] || null;
}

async function toggleVisible(id) {
  const { rows } = await pool.query(
    `UPDATE productos
        SET visible = NOT visible, actualizado_en = now()
      WHERE id = $1
      RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function toggleDisponible(id) {
  const { rows } = await pool.query(
    `UPDATE productos
        SET disponible = NOT disponible, actualizado_en = now()
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
    const { rows } = await client.query(
      'SELECT id, orden, categoria_id FROM productos WHERE id = $1',
      [id]
    );
    const current = rows[0];

    if (!current) {
      await client.query('ROLLBACK');
      return false;
    }

    const comparison = direction === 'up' ? '<' : '>';
    const sort = direction === 'up' ? 'DESC' : 'ASC';
    const neighborResult = await client.query(
      `SELECT id, orden FROM productos
        WHERE categoria_id = $1 AND orden ${comparison} $2
        ORDER BY orden ${sort}
        LIMIT 1`,
      [current.categoria_id, current.orden]
    );
    const neighbor = neighborResult.rows[0];

    if (!neighbor) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query('UPDATE productos SET orden = $1 WHERE id = $2', [
      neighbor.orden,
      current.id,
    ]);
    await client.query('UPDATE productos SET orden = $1 WHERE id = $2', [
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
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
  return rows[0].total;
}

async function menu() {
  const { rows } = await pool.query(
    `SELECT c.id AS categoria_id,
            c.nombre AS categoria_nombre,
            c.descripcion AS categoria_descripcion,
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.disponible,
            p.imagen_path
       FROM categorias c
       LEFT JOIN productos p ON p.categoria_id = c.id AND p.visible = true
      WHERE c.activo = true
      ORDER BY c.orden ASC, p.orden ASC, p.id ASC`
  );

  const categories = [];
  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.categoria_id)) {
      const category = {
        id: row.categoria_id,
        nombre: row.categoria_nombre,
        descripcion: row.categoria_descripcion,
        productos: [],
      };
      byId.set(row.categoria_id, category);
      categories.push(category);
    }

    if (row.id) {
      byId.get(row.categoria_id).productos.push({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: row.precio,
        disponible: row.disponible,
        imagen_path: row.imagen_path,
      });
    }
  }

  return categories;
}

module.exports = {
  allWithCategory,
  findById,
  create,
  update,
  toggleVisible,
  toggleDisponible,
  move,
  count,
  menu,
};
