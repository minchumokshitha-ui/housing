(() => {
  const listingsKey = 'ehousingSellerListings';
  const form = document.querySelector('#property-listing-form');
  if (!form) {
    return;
  }

  const photoInput = form.querySelector('[name="photo"]');
  const phoneInput = form.querySelector('[name="sellerPhone"]');
  const preview = document.querySelector('#photo-preview');
  const errorMessage = document.querySelector('#listing-form-error');
  const maxPhotoBytes = 8 * 1024 * 1024;
  let previewUrl = '';

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  };

  photoInput.addEventListener('change', () => {
    errorMessage.hidden = true;
    const file = photoInput.files[0];
    if (!file) {
      preview.hidden = true;
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      photoInput.value = '';
      preview.hidden = true;
      showError('Choose a JPG, PNG or WebP image file.');
      return;
    }
    if (file.size > maxPhotoBytes) {
      photoInput.value = '';
      preview.hidden = true;
      showError('The selected photo is too large. Choose an image smaller than 8 MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
    preview.hidden = false;
  });

  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

  const makePhotoDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image could not be decoded.'));
      image.onload = () => {
        const scale = Math.min(1, 1200 / image.width, 900 / image.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Your browser could not prepare the selected image.'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 700_000 && quality > 0.5) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        canvas.width = 0;
        canvas.height = 0;

        if (dataUrl.length > 700_000) {
          reject(new Error('This photo is still too large after compression. Choose a smaller image.'));
          return;
        }
        resolve(dataUrl);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.hidden = true;
    const sellerPhone = phoneInput.value.trim();
    phoneInput.setCustomValidity(/^[0-9+()\s-]{8,20}$/.test(sellerPhone) ? '' : 'Enter a valid contact number.');
    if (!form.reportValidity()) {
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;

    try {
      const data = new FormData(form);
      const photo = await makePhotoDataUrl(photoInput.files[0]);
      const listing = {
        id: `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: String(data.get('title')).trim(),
        type: String(data.get('type')).trim(),
        listing: String(data.get('listing')).trim(),
        price: Number(data.get('price')),
        city: String(data.get('city')).trim(),
        location: String(data.get('location')).trim(),
        bedrooms: Number(data.get('bedrooms')),
        bathrooms: Number(data.get('bathrooms')),
        area: Number(data.get('area')),
        description: String(data.get('description')).trim(),
        photo,
        sellerName: String(data.get('sellerName')).trim(),
        sellerPhone,
        sellerEmail: String(data.get('sellerEmail')).trim(),
        createdAt: new Date().toISOString()
      };

      const existing = JSON.parse(window.localStorage.getItem(listingsKey) || '[]');
      if (!Array.isArray(existing)) {
        throw new Error('Saved property listings are in an invalid format. Clear the demo listings and try again.');
      }
      window.localStorage.setItem(listingsKey, JSON.stringify([listing, ...existing]));
      form.reset();
      preview.hidden = true;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = '';
      }
      const returnPage = form.dataset.returnPage || 'add-property.html';
      window.location.href = `${returnPage}?published=${encodeURIComponent(listing.id)}`;
    } catch (error) {
      console.error('Could not publish the E-Housing property listing.', error);
      showError(error instanceof Error
        ? `${error.message} Your listing was not published.`
        : 'Your listing could not be published. Your listing was not saved.');
    } finally {
      submitButton.disabled = false;
    }
  });
})();
