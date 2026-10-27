const categoryModel = require('../models/categoryModel');

function renderForm(res, options) {
  return res.status(options.status || 200).render('admin/categorias/form', {
    title: options.title,
    category: options.category || null,
    form: options.form || { nombre: '', descripcion: '' },
    errors: options.errors || [],
  });
}

async function index(req, res, next) {
  try {
    const categories = await categoryModel.all();
    res.render('admin/categorias/index', {
      title: 'Categorías',
      categories,
    });
  } catch (error) {
    next(error);
  }
}

function newForm(req, res) {
  renderForm(res, { title: 'Nueva categoría' });
}

async function create(req, res, next) {
  const form = {
    nombre: (req.body.nombre || '').trim(),
    descripcion: (req.body.descripcion || '').trim(),
  };
  const errors = [];

  if (!form.nombre) {
    errors.push('El nombre es obligatorio.');
  }

  if (errors.length > 0) {
    return renderForm(res, { title: 'Nueva categoría', form, errors, status: 422 });
  }

  try {
    await categoryModel.create(form);
    req.flash('success', 'Categoría creada.');
    return res.redirect('/admin/categorias');
  } catch (error) {
    return next(error);
  }
}

async function editForm(req, res, next) {
  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      req.flash('error', 'La categoría no existe.');
      return res.redirect('/admin/categorias');
    }

    return renderForm(res, {
      title: 'Editar categoría',
      category,
      form: { nombre: category.nombre, descripcion: category.descripcion || '' },
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  const form = {
    nombre: (req.body.nombre || '').trim(),
    descripcion: (req.body.descripcion || '').trim(),
  };
  const errors = [];

  if (!form.nombre) {
    errors.push('El nombre es obligatorio.');
  }

  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      req.flash('error', 'La categoría no existe.');
      return res.redirect('/admin/categorias');
    }

    if (errors.length > 0) {
      return renderForm(res, {
        title: 'Editar categoría',
        category,
        form,
        errors,
        status: 422,
      });
    }

    await categoryModel.update(category.id, form);
    req.flash('success', 'Categoría actualizada.');
    return res.redirect('/admin/categorias');
  } catch (error) {
    return next(error);
  }
}

async function toggle(req, res, next) {
  try {
    const category = await categoryModel.toggleActivo(req.params.id);

    if (!category) {
      req.flash('error', 'La categoría no existe.');
    } else {
      req.flash(
        'success',
        category.activo ? 'Categoría visible en el menú.' : 'Categoría oculta del menú.'
      );
    }

    return res.redirect('/admin/categorias');
  } catch (error) {
    return next(error);
  }
}

async function move(req, res, next) {
  try {
    const direction = req.body.direction === 'up' ? 'up' : 'down';
    await categoryModel.move(req.params.id, direction);
    return res.redirect('/admin/categorias');
  } catch (error) {
    return next(error);
  }
}

module.exports = { index, newForm, create, editForm, update, toggle, move };
