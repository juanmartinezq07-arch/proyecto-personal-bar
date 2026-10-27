document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('imagen');
  const preview = document.getElementById('preview');

  if (!input || !preview) {
    return;
  }

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      preview.src = reader.result;
      preview.hidden = false;
    });
    reader.readAsDataURL(file);
  });
});
