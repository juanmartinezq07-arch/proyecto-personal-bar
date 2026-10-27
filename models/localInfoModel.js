const pool = require('../config/db');

async function get() {
  const { rows } = await pool.query('SELECT * FROM local_info WHERE id = 1');
  return rows[0] || null;
}

async function update(data) {
  const { rows } = await pool.query(
    `UPDATE local_info
        SET nombre = $1,
            descripcion_corta = $2,
            descripcion_larga = $3,
            direccion = $4,
            horarios_json = $5::jsonb,
            ubicacion_link = $6,
            telefono = $7,
            actualizado_en = now()
      WHERE id = 1
      RETURNING *`,
    [
      data.nombre,
      data.descripcion_corta,
      data.descripcion_larga,
      data.direccion,
      JSON.stringify(data.horarios),
      data.ubicacion_link,
      data.telefono,
    ]
  );

  return rows[0];
}

module.exports = { get, update };
