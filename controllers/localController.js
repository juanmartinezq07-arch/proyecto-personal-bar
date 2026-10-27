const localInfoModel = require('../models/localInfoModel');
const { parseHorarios, formatHorarios } = require('../utils/form');

function buildForm(body) {
  return {
    nombre: (body.nombre || '').trim(),
    descripcion_corta: (body.descripcion_corta || '').trim(),
    descripcion_larga: (body.descripcion_larga || '').trim(),
    direccion: (body.direccion || '').trim(),
    horarios_texto: (body.horarios_texto || '').trim(),
    ubicacion_link: (body.ubicacion_link || '').trim(),
    telefono: (body.telefono || '').trim(),
  };
}

function renderForm(res, options) {
  return res.status(options.status || 200).render('admin/local', {
    title: 'Datos del local',
    form: options.form,
    errors: options.errors || [],
  });
}

async function editForm(req, res, next) {
  try {
    const local = await localInfoModel.get();

    if (!local) {
      return renderForm(res, {
        form: buildForm({}),
        errors: ['No se encontraron los datos del local. Ejecutá npm run db:setup.'],
        status: 500,
      });
    }

    return renderForm(res, {
      form: {
        nombre: local.nombre,
        descripcion_corta: local.descripcion_corta || '',
        descripcion_larga: local.descripcion_larga || '',
        direccion: local.direccion || '',
        horarios_texto: formatHorarios(local.horarios_json),
        ubicacion_link: local.ubicacion_link || '',
        telefono: local.telefono || '',
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  const form = buildForm(req.body);
  const errors = [];

  if (!form.nombre) {
    errors.push('El nombre del local es obligatorio.');
  }

  const horarios = parseHorarios(form.horarios_texto);

  if (form.horarios_texto && horarios.length === 0) {
    errors.push('Revisá el formato de los horarios (Días | Horario, uno por línea).');
  }

  if (errors.length > 0) {
    return renderForm(res, { form, errors, status: 422 });
  }

  try {
    await localInfoModel.update({
      nombre: form.nombre,
      descripcion_corta: form.descripcion_corta,
      descripcion_larga: form.descripcion_larga,
      direccion: form.direccion,
      horarios,
      ubicacion_link: form.ubicacion_link,
      telefono: form.telefono,
    });

    req.flash('success', 'Datos del local actualizados.');
    return res.redirect('/admin/local');
  } catch (error) {
    return next(error);
  }
}

module.exports = { editForm, update };
