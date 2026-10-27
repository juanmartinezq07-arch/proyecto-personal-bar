function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  req.flash('error', 'Necesitás iniciar sesión para acceder al panel.');
  return res.redirect('/admin/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }

  return next();
}

module.exports = { requireAuth, redirectIfAuth };
