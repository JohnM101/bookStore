// Add at the top
const generateSlug = (name, volume) => {
  if (!name) return '';
  let base = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  if (volume) base += `-vol-${volume}`;
  return base;
};

// Replace handleInputChange with:
const handleInputChange = (e) => {
  const { name, value, files } = e.target;
  let updatedData = { ...formData };

  if (name === 'image' && files.length > 0) {
    updatedData.image = files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(files[0]);
  } else {
    updatedData[name] = value;
  }

  // Auto-generate slug if not manually edited
  if ((name === 'name' || name === 'volumeNumber') && !isSlugEdited) {
    updatedData.slug = generateSlug(
      name === 'name' ? value : formData.name,
      name === 'volumeNumber' ? value : formData.volumeNumber
    );
  }

  // Detect manual slug edits
  if (name === 'slug') {
    setIsSlugEdited(true);
    if (!value) { // regenerate if cleared
      updatedData.slug = generateSlug(formData.name, formData.volumeNumber);
      setIsSlugEdited(false);
    }
  }

  setFormData(updatedData);
};
