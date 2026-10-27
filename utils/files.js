const fs = require('fs/promises');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads');

async function removeUpload(imagenPath) {
  if (!imagenPath) {
    return;
  }

  const fileName = path.basename(imagenPath);
  const absolutePath = path.join(uploadsRoot, fileName);

  if (path.dirname(absolutePath) !== uploadsRoot) {
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('No se pudo borrar la imagen anterior:', error.message);
    }
  }
}

module.exports = { removeUpload };
