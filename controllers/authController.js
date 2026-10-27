const bcrypt = require('bcryptjs');
const adminModel = require('../models/adminModel');

function showLogin(req, res) {
  res.render('admin/login', { title: 'Acceso administración' });
}

async function login(req, res, next) {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      req.flash('error', 'Ingresá usuario y contraseña.');
      return res.redirect('/admin/login');
    }

    const user = await adminModel.findByUsername(username);
    const validPassword = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !validPassword) {
      req.flash('error', 'Usuario o contraseña incorrectos.');
      return res.redirect('/admin/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      rol: user.rol,
    };

    req.flash('success', `Bienvenido, ${user.username}.`);
    return res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    return res.redirect('/');
  });
}

module.exports = { showLogin, login, logout };
