function parseHorarios(text) {
  if (!text) {
    return [];
  }

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [dias, horario] = line.split('|').map((part) => (part || '').trim());
      return { dias: dias || '', horario: horario || '' };
    })
    .filter((item) => item.dias || item.horario);
}

function formatHorarios(horarios) {
  if (!Array.isArray(horarios)) {
    return '';
  }

  return horarios.map((item) => `${item.dias} | ${item.horario}`).join('\n');
}

function parsePrice(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim().replace(',', '.');
  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function checkbox(value) {
  return value === 'on' || value === 'true' || value === true;
}

module.exports = { parseHorarios, formatHorarios, parsePrice, checkbox };
