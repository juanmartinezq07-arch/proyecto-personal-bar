const express = require('express');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const localController = require('../controllers/localController');
const { requireAuth, redirectIfAuth } = require('../middlewares/auth');
const { handleSingleImage } = require('../middlewares/upload');

const router = express.Router();

router.get('/login', redirectIfAuth, authController.showLogin);
router.post('/login', redirectIfAuth, authController.login);
router.post('/logout', requireAuth, authController.logout);

router.use(requireAuth);

router.get('/', dashboardController.index);

router.get('/categorias', categoryController.index);
router.get('/categorias/nueva', categoryController.newForm);
router.post('/categorias', categoryController.create);
router.get('/categorias/:id/editar', categoryController.editForm);
router.post('/categorias/:id', categoryController.update);
router.post('/categorias/:id/visibilidad', categoryController.toggle);
router.post('/categorias/:id/mover', categoryController.move);

router.get('/productos', productController.index);
router.get('/productos/nuevo', productController.newForm);
router.post('/productos', handleSingleImage, productController.create);
router.get('/productos/:id/editar', productController.editForm);
router.post('/productos/:id', handleSingleImage, productController.update);
router.post('/productos/:id/visibilidad', productController.toggleVisible);
router.post('/productos/:id/disponibilidad', productController.toggleDisponible);
router.post('/productos/:id/mover', productController.move);

router.get('/local', localController.editForm);
router.post('/local', localController.update);

module.exports = router;
