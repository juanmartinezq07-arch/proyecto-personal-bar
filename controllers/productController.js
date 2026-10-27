const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const { parsePrice, checkbox } = require('../utils/form');
const { removeUpload } = require('../utils/files');

function renderForm(res, options) {
  return res.status(options.status || 200).render('admin/productos/form', {
    title: options.title,
    product: options.product || null,
    categories: options.categories,
    form: options.form,
    errors: options.errors || [],
  });
}

function buildForm(body, fallbackImage) {
  return {
    categoria_id: body.categoria_id || '',
    nombre: (body.nombre || '').trim(),
    descripcion: (body.descripcion || '').trim(),
    precio: (body.precio || '').trim(),
    disponible: checkbox(body.disponible),
    visible: checkbox(body.visible),
    imagen_path: fallbackImage || null,
  };
}

function validateForm(form, categories) {
  const errors = [];

  if (!form.nombre) {
    errors.push('El nombre es obligatorio.');
  }

  if (!form.categoria_id) {
    errors.push('Seleccioná una categoría.');
  } else if (!categories.some((category) => String(category.id) === String(form.categoria_id))) {
    errors.push('La categoría seleccionada no existe.');
  }

  if (parsePrice(form.precio) === null) {
    errors.push('El precio debe ser un número mayor o igual a cero.');
  }

  return errors;
}

async function index(req, res, next) {
  try {
    const [products, categories] = await Promise.all([
      productModel.allWithCategory(),
      categoryModel.all(),
    ]);

    res.render('admin/productos/index', {
      title: 'Productos',
      products,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

async function newForm(req, res, next) {
  try {
    const categories = await categoryModel.all();

    if (categories.length === 0) {
      req.flash('error', 'Primero creá una categoría.');
      return res.redirect('/admin/categorias/nueva');
    }

    return renderForm(res, {
      title: 'Nuevo producto',
      categories,
      form: {
        categoria_id: req.query.categoria || '',
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: true,
        visible: true,
        imagen_path: null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  let categories = [];

  try {
    categories = await categoryModel.all();
  } catch (error) {
    return next(error);
  }

  const uploadedPath = req.file ? `/uploads/${req.file.filename}` : null;
  const form = buildForm(req.body, uploadedPath);
  const errors = validateForm(form, categories);

  if (errors.length > 0) {
    if (uploadedPath) {
      await removeUpload(uploadedPath);
    }

    return renderForm(res, {
      title: 'Nuevo producto',
      categories,
      form: { ...form, imagen_path: null },
      errors,
      status: 422,
    });
  }

  try {
    await productModel.create({
      categoria_id: Number(form.categoria_id),
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parsePrice(form.precio),
      disponible: form.disponible,
      visible: form.visible,
      imagen_path: uploadedPath,
    });

    req.flash('success', 'Producto creado.');
    return res.redirect('/admin/productos');
  } catch (error) {
    if (uploadedPath) {
      await removeUpload(uploadedPath);
    }
    return next(error);
  }
}

async function editForm(req, res, next) {
  try {
    const [product, categories] = await Promise.all([
      productModel.findById(req.params.id),
      categoryModel.all(),
    ]);

    if (!product) {
      req.flash('error', 'El producto no existe.');
      return res.redirect('/admin/productos');
    }

    return renderForm(res, {
      title: 'Editar producto',
      product,
      categories,
      form: {
        categoria_id: product.categoria_id,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio,
        disponible: product.disponible,
        visible: product.visible,
        imagen_path: product.imagen_path,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  let product;
  let categories;

  try {
    [product, categories] = await Promise.all([
      productModel.findById(req.params.id),
      categoryModel.all(),
    ]);
  } catch (error) {
    return next(error);
  }

  if (!product) {
    req.flash('error', 'El producto no existe.');
    return res.redirect('/admin/productos');
  }

  const uploadedPath = req.file ? `/uploads/${req.file.filename}` : null;
  const removeCurrent = checkbox(req.body.eliminar_imagen);
  const currentImage = removeCurrent ? null : product.imagen_path;
  const form = buildForm(req.body, uploadedPath || currentImage);
  const errors = validateForm(form, categories);

  if (errors.length > 0) {
    if (uploadedPath) {
      await removeUpload(uploadedPath);
    }

    form.imagen_path = currentImage;

    return renderForm(res, {
      title: 'Editar producto',
      product,
      categories,
      form,
      errors,
      status: 422,
    });
  }

  try {
    await productModel.update(product.id, {
      categoria_id: Number(form.categoria_id),
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parsePrice(form.precio),
      disponible: form.disponible,
      visible: form.visible,
      imagen_path: uploadedPath || currentImage,
    });

    if ((uploadedPath || removeCurrent) && product.imagen_path) {
      await removeUpload(product.imagen_path);
    }

    req.flash('success', 'Producto actualizado.');
    return res.redirect('/admin/productos');
  } catch (error) {
    if (uploadedPath) {
      await removeUpload(uploadedPath);
    }
    return next(error);
  }
}

async function toggleVisible(req, res, next) {
  try {
    const product = await productModel.toggleVisible(req.params.id);

    if (!product) {
      req.flash('error', 'El producto no existe.');
    } else {
      req.flash(
        'success',
        product.visible ? 'Producto visible en el menú.' : 'Producto oculto del menú.'
      );
    }

    return res.redirect('/admin/productos');
  } catch (error) {
    return next(error);
  }
}

async function toggleDisponible(req, res, next) {
  try {
    const product = await productModel.toggleDisponible(req.params.id);

    if (!product) {
      req.flash('error', 'El producto no existe.');
    } else {
      req.flash(
        'success',
        product.disponible ? 'Producto marcado como disponible.' : 'Producto marcado sin stock.'
      );
    }

    return res.redirect('/admin/productos');
  } catch (error) {
    return next(error);
  }
}

async function move(req, res, next) {
  try {
    const direction = req.body.direction === 'up' ? 'up' : 'down';
    await productModel.move(req.params.id, direction);
    return res.redirect('/admin/productos');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  newForm,
  create,
  editForm,
  update,
  toggleVisible,
  toggleDisponible,
  move,
};
