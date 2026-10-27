const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${unique}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isValid = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension);

    if (!isValid) {
      return cb(new Error('La imagen debe ser JPG, PNG o WEBP.'));
    }

    return cb(null, true);
  },
});

function handleSingleImage(req, res, next) {
  const middleware = upload.single('imagen');

  middleware(req, res, (error) => {
    if (!error) {
      return next();
    }

    let message = 'No se pudo subir la imagen.';
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'La imagen supera el límite de 5 MB.';
    } else if (error.message) {
      message = error.message;
    }

    req.flash('error', message);
    return res.redirect(req.get('Referer') || '/admin/productos');
  });
}

module.exports = { handleSingleImage, uploadDir };
