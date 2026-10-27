CREATE TABLE IF NOT EXISTS usuarios_admin (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS local_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre VARCHAR(120) NOT NULL,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  direccion VARCHAR(255),
  horarios_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  ubicacion_link TEXT,
  telefono VARCHAR(50),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  disponible BOOLEAN NOT NULL DEFAULT true,
  visible BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  imagen_path VARCHAR(255),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_categorias_orden ON categorias (orden);
CREATE INDEX IF NOT EXISTS idx_productos_orden ON productos (categoria_id, orden);
