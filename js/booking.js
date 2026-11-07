(() => {
  const properties = {
    'luxury-independent-house': {
      title: 'Luxury Independent House',
      location: 'Vijayanagar, Mysuru, Karnataka',
      price: '₹85,00,000',
      listing: 'For Sale'
    },
    'modern-2bhk-apartment': {
      title: 'Modern 2BHK Apartment',
      location: 'Whitefield, Bengaluru, Karnataka',
      price: '₹25,000 / month',
      listing: 'For Rent'
    },
    'beautiful-family-villa': {
      title: 'Beautiful Family Villa',
      location: 'Mangaluru, Karnataka',
      price: '₹1,20,00,000',
      listing: 'For Sale'
    },
    'garden-view-1bhk-apartment': {
      title: 'Garden View 1BHK Apartment',
      location: 'Jayanagar, Bengaluru, Karnataka',
      price: '₹18,000 / month',
      listing: 'For Rent'
    },
    'family-home-mysuru': {
      title: 'Bright 3BHK Family Home',
      location: 'Saraswathipuram, Mysuru, Karnataka',
      price: '₹32,000 / month',
      listing: 'For Rent'
    },
    'lakeview-3bhk-apartment': {
      title: 'Lakeview 3BHK Apartment',
      location: 'Hebbal, Bengaluru, Karnataka',
      price: '₹78,00,000',
      listing: 'For Sale'
    },
    'courtyard-family-home': {
      title: 'Courtyard Family Home',
      location: 'Vidyanagar, Hubballi, Karnataka',
      price: '₹68,00,000',
      listing: 'For Sale'
    }
  };
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('property');
  const purchaseRequested = params.get('intent') === 'buy';
  let property = properties[propertyId];
  if (!property && propertyId) {
    try {
      const sellerListings = JSON.parse(window.localStorage.getItem('ehousingSellerListings') || '[]');
      const sellerListing = Array.isArray(sellerListings)
        ? sellerListings.find((listing) => listing && listing.id === propertyId)
        : null;
      if (sellerListing) {
        property = {
          title: sellerListing.title,
          location: `${sellerListing.location}, ${sellerListing.city}, Karnataka`,
          price: `₹${Number(sellerListing.price).toLocaleString('en-IN')}${sellerListing.listing === 'For Rent' ? ' / month' : ''}`,
          listing: sellerListing.listing
        };
      }
    } catch (error) {
      console.error('Could not load the seller listing for this booking request.', error);
    }
  }
  const form = document.querySelector('#hold-form');
  const error = document.querySelector('#booking-error');
  const phoneInput = form?.querySelector('[name="phone"]');
  const paymentField = document.querySelector('#payment-preference-field');
  const paymentSelect = form?.querySelector('[name="paymentMethod"]');

  if (!property || !form) {
    if (error) {
      error.hidden = false;
      error.textContent = 'This property could not be found. Please return to the property details page and try again.';
    }
    if (form) {
      form.hidden = true;
    }
    return;
  }

  const isPurchase = purchaseRequested && property.listing === 'For Sale';
  if (purchaseRequested && property.listing !== 'For Sale') {
    if (error) {
      error.hidden = false;
      error.textContent = 'Purchase requests are only available for properties listed for sale.';
    }
    form.hidden = true;
    return;
  }

  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

  document.querySelector('#booking-property-title').textContent = property.title;
  document.querySelector('#booking-property-location').textContent = property.location;
  document.querySelector('#booking-property-price').textContent = property.price;
  document.querySelector('#booking-property-listing').textContent = property.listing;
  document.querySelector('#booking-property-link').href = `property-details.html#${propertyId}`;
  if (isPurchase) {
    document.title = 'Purchase Inquiry | E-Housing';
    document.querySelector('#booking-page-title').textContent = 'Purchase Inquiry';
    document.querySelector('#booking-intro').textContent = 'Tell the seller you are interested in buying this property.';
    document.querySelector('#booking-form-title').textContent = 'Your purchase details';
    document.querySelector('#booking-notice').textContent = 'Send a purchase inquiry and your preferred payment method. This demo does not process payments or confirm a sale.';
    document.querySelector('#booking-submit').innerHTML = 'Send Purchase Inquiry <span aria-hidden="true">→</span>';
    paymentField.hidden = false;
    paymentSelect.disabled = false;
    paymentSelect.required = true;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const phone = String(formData.get('phone')).trim();
    phoneInput.setCustomValidity(/^[0-9+()\s-]{8,20}$/.test(phone) ? '' : 'Enter a valid phone number.');
    if (!form.reportValidity()) {
      return;
    }

    const request = {
      propertyId,
      intent: isPurchase ? 'purchase' : 'hold',
      name: String(formData.get('name')).trim(),
      phone,
      email: String(formData.get('email')).trim(),
      paymentMethod: isPurchase ? String(formData.get('paymentMethod')) : '',
      requestedAt: new Date().toISOString()
    };

    try {
      const savedRequests = JSON.parse(window.localStorage.getItem('ehousingHoldRequests') || '[]');
      if (!Array.isArray(savedRequests)) {
        throw new Error('Stored hold requests are invalid.');
      }
      savedRequests.push(request);
      window.localStorage.setItem('ehousingHoldRequests', JSON.stringify(savedRequests));
    } catch (storageError) {
      console.error('Could not save the property hold request.', storageError);
      if (error) {
        error.hidden = false;
        error.textContent = 'Your request could not be saved in this browser. Please enable browser storage and try again.';
      }
      return;
    }

    form.hidden = true;
    const confirmation = document.querySelector('#booking-confirmation');
    confirmation.hidden = false;
    document.querySelector('#confirmation-name').textContent = request.name;
    if (isPurchase) {
      document.querySelector('#confirmation-title').textContent = 'Purchase inquiry saved';
      const message = document.querySelector('#confirmation-message');
      const name = document.querySelector('#confirmation-name');
      message.replaceChildren(
        document.createTextNode('Thanks, '),
        name,
        document.createTextNode('. Your purchase inquiry and payment preference are saved in this browser. No payment was made, and the sale is not confirmed.')
      );
    }
  });
})();
