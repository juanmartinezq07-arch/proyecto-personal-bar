require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);

const pool = require('./config/db');
const localInfoModel = require('./models/localInfoModel');
const flash = require('./middlewares/flash');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'desarrollo-cambiar-este-secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(flash);

app.use(async (req, res, next) => {
  try {
    res.locals.local = await localInfoModel.get();
  } catch (error) {
    res.locals.local = null;
  }

  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.formatPrice = (value) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(Number(value));

  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('public/404', { title: 'Página no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).render('public/error', {
    title: 'Error',
    status,
    message: status === 404 ? 'La página no existe.' : 'Ocurrió un error inesperado.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});
