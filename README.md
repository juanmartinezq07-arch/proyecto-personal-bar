# Proyecto Personal Bar - "ficticio"

Aplicación web para un bar ficticio en Mendoza, Argentina. Proyecto con fines de aprendizaje y para mostrar en portfolio.

## Estado actual

MVP implementado y probado localmente:

- Inicio con presentación, horarios, ubicación y accesos al menú.
- Menú público agrupado por categorías, con precios, disponibilidad e imágenes.
- Sección "Sobre nosotros".
- Panel de administración con login para un único usuario administrador.
- Gestión de categorías: crear, editar, ocultar/mostrar y ordenar.
- Gestión de productos: crear, editar, ocultar/mostrar, marcar disponible/sin stock, ordenar y subir imágenes.
- Edición de los datos básicos del local (nombre, descripciones, dirección, horarios, teléfono y link de ubicación).

Fuera de alcance por ahora: reservas de mesas (segunda etapa), pedidos, pagos, inventario, cuentas de clientes e integraciones externas.

## Stack

- Node.js + Express
- EJS como motor de vistas
- HTML5 + CSS puro + JavaScript vanilla
- PostgreSQL con `pg` y SQL directo
- Sesiones con `express-session` + `connect-pg-simple`
- Contraseñas con `bcryptjs`
- Subida de imágenes con `multer` (guardado local en `public/uploads/`)

## Requisitos

- Node.js 20 o superior
- PostgreSQL en ejecución

## Puesta en marcha

```bash
npm install
```

Crear el archivo `.env` a partir de `.env.example` y ajustar las credenciales:

```env
PORT=3000
SESSION_SECRET=cambiar-por-un-secreto-largo
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/bar_ficticio
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Preparar la base de datos (crea la base si no existe, aplica el esquema y carga datos de ejemplo):

```bash
npm run db:setup
```

Iniciar el servidor:

```bash
npm run dev
```

Sitio público: http://localhost:3000

Panel: http://localhost:3000/admin/login

Credenciales iniciales: `admin` / `admin123` (definidas en `.env` antes del primer `db:setup`).

## Scripts

| Script | Descripción |
| --- | --- |
| `npm start` | Ejecuta el servidor |
| `npm run dev` | Ejecuta el servidor con recarga automática (`node --watch`) |
| `npm run db:setup` | Crea la base, aplica el esquema y carga datos iniciales |

## Rutas principales

Públicas:

- `GET /` - Inicio
- `GET /menu` - Menú
- `GET /nosotros` - Sobre nosotros

Administración:

- `GET /admin/login` - Login
- `POST /admin/login` - Autenticación
- `POST /admin/logout` - Cerrar sesión
- `GET /admin` - Resumen
- `GET /admin/categorias` - Listado de categorías
- `GET /admin/productos` - Listado de productos
- `GET /admin/local` - Datos del local

## Estructura

```
proyecto-personal-bar/
├── config/            Conexión a PostgreSQL
├── controllers/       Lógica de cada sección
├── middlewares/       Auth, flash y subida de archivos
├── models/            Consultas SQL
├── public/            CSS, JS y uploads
├── routes/            Rutas públicas y de administración
├── seeds/             Esquema SQL y carga inicial
├── utils/             Helpers de formularios y archivos
├── views/             Vistas EJS (públicas, admin y partials)
├── .env.example
├── server.js
└── package.json
```

## Entidades

- `local_info`: datos del bar (registro único).
- `usuarios_admin`: usuarios del panel; el modelo permite agregar más en el futuro.
- `categorias`: nombre, descripción, orden y visibilidad.
- `productos`: categoría, nombre, descripción, precio, disponibilidad, visibilidad, orden e imagen.

Las reservas quedan para la segunda etapa. La tabla correspondiente no forma parte del MVP.

## Decisiones y notas

- SQL directo en lugar de ORM para practicar consultas y el modelo relacional.
- `visible` y `disponible` son campos separados: ocultar un producto es distinto de marcarlo sin stock.
- Las imágenes se guardan en `public/uploads/`, que está ignorado por git (se conserva `.gitkeep`).
- Los formularios usan POST y redirecciones; las validaciones mínimas devuelven errores en la misma vista.
- Para producción habría que sumar protección CSRF, límites de intentos de login y almacenamiento de imágenes externo.

## Próxima etapa: reservas

Fuera del MVP. Diseño previsto: el cliente envía una solicitud con fecha, horario y cantidad de personas; la administración la revisa y puede confirmarla o rechazarla. El sitio debe aclarar que enviar la solicitud no confirma automáticamente la reserva.
