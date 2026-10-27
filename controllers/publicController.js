const productModel = require('../models/productModel');
const localInfoModel = require('../models/localInfoModel');

async function home(req, res, next) {
  try {
    const local = await localInfoModel.get();
    const categories = await productModel.menu();

    res.render('public/home', {
      title: local ? local.nombre : 'Inicio',
      local,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

async function menu(req, res, next) {
  try {
    const local = await localInfoModel.get();
    const categories = await productModel.menu();

    res.render('public/menu', {
      title: 'Menú',
      local,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

async function about(req, res, next) {
  try {
    const local = await localInfoModel.get();
    res.render('public/nosotros', {
      title: 'Sobre nosotros',
      local,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { home, menu, about };
