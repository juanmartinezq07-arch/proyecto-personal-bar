require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Falta DATABASE_URL en el archivo .env');
  process.exit(1);
}

async function ensureDatabase() {
  const url = new URL(connectionString);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));

  if (!dbName) {
    throw new Error('DATABASE_URL debe incluir el nombre de la base de datos');
  }

  const adminUrl = new URL(connectionString);
  adminUrl.pathname = '/postgres';

  const adminPool = new Pool({ connectionString: adminUrl.toString() });

  try {
    const { rows } = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`Base de datos "${dbName}" creada.`);
    }
  } finally {
    await adminPool.end();
  }
}

async function seedData(pool) {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  await pool.query(
    `INSERT INTO local_info
       (id, nombre, descripcion_corta, descripcion_larga, direccion, horarios_json, ubicacion_link, telefono)
     VALUES (1, $1, $2, $3, $4, $5::jsonb, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      'ficticio',
      'Bar ficticio en Mendoza, Argentina.',
      'Un bar pensado para compartir momentos. Proyecto con fines de aprendizaje y portfolio.',
      'Calle Ficticia 123, Mendoza, Argentina',
      JSON.stringify([
        { dias: 'Lunes a Viernes', horario: '18:00 - 01:00' },
        { dias: 'Sábados y Domingos', horario: '17:00 - 02:00' },
      ]),
      'https://maps.google.com',
      '+54 261 000-0000',
    ]
  );

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const existingAdmin = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios_admin');

  if (existingAdmin.rows[0].total === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO usuarios_admin (username, password_hash) VALUES ($1, $2)',
      [adminUsername, passwordHash]
    );
    console.log(`Administrador inicial creado: ${adminUsername}`);
  }

  const existingCategories = await pool.query('SELECT COUNT(*)::int AS total FROM categorias');

  if (existingCategories.rows[0].total === 0) {
    const categories = [
      { nombre: 'Cervezas', orden: 1 },
      { nombre: 'Tragos', orden: 2 },
      { nombre: 'Pizzas', orden: 3 },
      { nombre: 'Bebidas sin alcohol', orden: 4 },
    ];

    const ids = {};

    for (const category of categories) {
      const { rows } = await pool.query(
        'INSERT INTO categorias (nombre, orden) VALUES ($1, $2) RETURNING id',
        [category.nombre, category.orden]
      );
      ids[category.nombre] = rows[0].id;
    }

    const products = [
      {
        categoria: 'Cervezas',
        nombre: 'Pinta Artesanal',
        descripcion: 'Tirada fresca',
        precio: 2500,
      },
      {
        categoria: 'Tragos',
        nombre: 'Fernet con Cola',
        descripcion: 'Clásico mendocino',
        precio: 3200,
      },
      {
        categoria: 'Pizzas',
        nombre: 'Muzzarella',
        descripcion: 'Salsa, muzzarella y orégano',
        precio: 8500,
      },
      {
        categoria: 'Bebidas sin alcohol',
        nombre: 'Agua Mineral',
        descripcion: '500 ml',
        precio: 1200,
      },
    ];

    let orden = 1;

    for (const product of products) {
      await pool.query(
        `INSERT INTO productos (categoria_id, nombre, descripcion, precio, orden)
         VALUES ($1, $2, $3, $4, $5)`,
        [ids[product.categoria], product.nombre, product.descripcion, product.precio, orden]
      );
      orden += 1;
    }

    console.log('Categorías y productos de ejemplo cargados.');
  }
}

(async () => {
  try {
    await ensureDatabase();
    const pool = new Pool({ connectionString });
    await seedData(pool);
    await pool.end();
    console.log('Base de datos lista.');
  } catch (error) {
    console.error('Error preparando la base de datos:', error.message);
    process.exit(1);
  }
})();
