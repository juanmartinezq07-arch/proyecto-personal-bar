const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const localInfoModel = require('../models/localInfoModel');

async function index(req, res, next) {
  try {
    const [categories, products, local] = await Promise.all([
      categoryModel.count(),
      productModel.count(),
      localInfoModel.get(),
    ]);

    res.render('admin/dashboard', {
      title: 'Panel de administración',
      totals: { categories, products },
      local,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { index };
