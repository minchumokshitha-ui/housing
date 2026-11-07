(() => {
  const favoritesKey = 'ehousingFavorites';
  const properties = {
    'luxury-independent-house': {
      title: 'Luxury Independent House',
      type: 'Independent House',
      city: 'Mysuru',
      location: 'Vijayanagar, Mysuru, Karnataka',
      price: '₹85,00,000',
      listing: 'For Sale',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Contemporary independent house surrounded by greenery',
      beds: '3 beds',
      baths: '2 baths',
      area: '1,800 sq.ft'
    },
    'modern-2bhk-apartment': {
      title: 'Modern 2BHK Apartment',
      type: 'Apartment',
      city: 'Bengaluru',
      location: 'Whitefield, Bengaluru, Karnataka',
      price: '₹25,000 / month',
      listing: 'For Rent',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Bright modern apartment interior',
      beds: '2 beds',
      baths: '2 baths',
      area: '1,200 sq.ft'
    },
    'beautiful-family-villa': {
      title: 'Beautiful Family Villa',
      type: 'Villa',
      city: 'Mangaluru',
      location: 'Mangaluru, Karnataka',
      price: '₹1,20,00,000',
      listing: 'For Sale',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Beautiful family villa with landscaped garden',
      beds: '4 beds',
      baths: '3 baths',
      area: '2,400 sq.ft'
    },
    'garden-view-1bhk-apartment': {
      title: 'Garden View 1BHK Apartment',
      type: 'Apartment',
      city: 'Bengaluru',
      location: 'Jayanagar, Bengaluru, Karnataka',
      price: '₹18,000 / month',
      listing: 'For Rent',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Warm, sunlit apartment living room with garden views',
      beds: '1 bed',
      baths: '1 bath',
      area: '750 sq.ft'
    },
    'family-home-mysuru': {
      title: 'Bright 3BHK Family Home',
      type: 'Independent House',
      city: 'Mysuru',
      location: 'Saraswathipuram, Mysuru, Karnataka',
      price: '₹32,000 / month',
      listing: 'For Rent',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Bright family home with a spacious, welcoming living room',
      beds: '3 beds',
      baths: '2 baths',
      area: '1,650 sq.ft'
    },
    'lakeview-3bhk-apartment': {
      title: 'Lakeview 3BHK Apartment',
      type: 'Apartment',
      city: 'Bengaluru',
      location: 'Hebbal, Bengaluru, Karnataka',
      price: '₹78,00,000',
      listing: 'For Sale',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Modern apartment building with a bright, spacious interior',
      beds: '3 beds',
      baths: '2 baths',
      area: '1,550 sq.ft'
    },
    'courtyard-family-home': {
      title: 'Courtyard Family Home',
      type: 'Independent House',
      city: 'Hubballi',
      location: 'Vidyanagar, Hubballi, Karnataka',
      price: '₹68,00,000',
      listing: 'For Sale',
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Contemporary family home with a peaceful private courtyard',
      beds: '3 beds',
      baths: '2 baths',
      area: '1,700 sq.ft'
    }
  };

  try {
    const sellerListings = JSON.parse(window.localStorage.getItem('ehousingSellerListings') || '[]');
    if (Array.isArray(sellerListings)) {
      sellerListings.forEach((listing) => {
        if (!listing || typeof listing.id !== 'string' || typeof listing.photo !== 'string') {
          return;
        }
        properties[listing.id] = {
          title: listing.title,
          type: listing.type,
          city: listing.city,
          location: `${listing.location}, ${listing.city}, Karnataka`,
          price: `₹${Number(listing.price).toLocaleString('en-IN')}${listing.listing === 'For Rent' ? ' / month' : ''}`,
          listing: listing.listing,
          image: listing.photo,
          imageAlt: `Photo of ${listing.title}`,
          beds: `${listing.bedrooms} beds`,
          baths: `${listing.bathrooms} baths`,
          area: `${Number(listing.area).toLocaleString('en-IN')} sq.ft`
        };
      });
    }
  } catch (error) {
    console.error('Could not load seller listings for E-Housing favorites.', error);
  }

  const showStorageError = (message) => {
    let alert = document.querySelector('.property-storage-error');
    if (!alert) {
      alert = document.createElement('p');
      alert.className = 'property-storage-error';
      alert.setAttribute('role', 'alert');
      document.querySelector('main')?.prepend(alert);
    }
    if (alert) {
      alert.textContent = message;
    }
  };

  const readFavorites = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(favoritesKey) || '[]');
      return Array.isArray(saved) ? saved.filter((id) => Object.hasOwn(properties, id)) : [];
    } catch (error) {
      console.error('Could not read saved E-Housing favorites.', error);
      showStorageError('Favorites could not be loaded. Please enable browser storage and reload this page.');
      return [];
    }
  };

  const saveFavorites = (favorites) => {
    try {
      window.localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Could not save E-Housing favorites.', error);
      showStorageError('Favorites could not be saved. Please enable browser storage and try again.');
      return false;
    }
  };

  const updateFavoriteButtons = (favorites) => {
    document.querySelectorAll('.favorite-btn[data-property-id]').forEach((button) => {
      const isFavorite = favorites.includes(button.dataset.propertyId);
      button.setAttribute('aria-pressed', String(isFavorite));
      button.classList.toggle('is-favorite', isFavorite);
      button.innerHTML = `<span aria-hidden="true">${isFavorite ? '♥' : '♡'}</span>${isFavorite ? 'Saved' : 'Add to Favorites'}`;
    });

    document.querySelectorAll('.favorites-count').forEach((count) => {
      count.textContent = String(favorites.length);
    });
  };

  const renderFavorites = (favorites) => {
    const list = document.querySelector('#favorites-list');
    const empty = document.querySelector('#favorites-empty');
    if (!list || !empty) {
      return;
    }

    list.replaceChildren();
    const savedProperties = favorites.filter((id) => properties[id]);
    empty.hidden = savedProperties.length > 0;

    savedProperties.forEach((id) => {
      const property = properties[id];
      const card = document.createElement('article');
      card.className = 'property-card';

      const imageLink = document.createElement('a');
      imageLink.className = 'property-image';
      imageLink.href = `property-details.html#${id}`;
      imageLink.setAttribute('aria-label', `View ${property.title}`);
      const image = document.createElement('img');
      image.src = property.image;
      image.alt = property.imageAlt;
      const badge = document.createElement('span');
      badge.className = `badge${property.listing === 'For Rent' ? ' rent-badge' : ''}`;
      badge.textContent = property.listing;
      imageLink.append(image, badge);

      const info = document.createElement('div');
      info.className = 'property-info';
      const type = document.createElement('p');
      type.className = 'property-type';
      type.textContent = `${property.type.toUpperCase()} · ${property.city.toUpperCase()}`;
      const title = document.createElement('h2');
      const titleLink = document.createElement('a');
      titleLink.href = `property-details.html#${id}`;
      titleLink.textContent = property.title;
      title.append(titleLink);
      const location = document.createElement('p');
      location.className = 'property-location';
      location.textContent = `📍 ${property.location}`;
      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = property.price;
      const meta = document.createElement('div');
      meta.className = 'property-meta';
      [property.beds, property.baths, property.area].forEach((item) => {
        const detail = document.createElement('span');
        detail.textContent = item;
        meta.append(detail);
      });

      const actions = document.createElement('div');
      actions.className = 'favorite-card-actions';
      const detailsLink = document.createElement('a');
      detailsLink.className = 'btn full-btn';
      detailsLink.href = `property-details.html#${id}`;
      detailsLink.textContent = 'View Details →';
      const removeButton = document.createElement('button');
      removeButton.className = 'favorite-btn is-favorite';
      removeButton.type = 'button';
      removeButton.dataset.propertyId = id;
      removeButton.setAttribute('aria-pressed', 'true');
      removeButton.innerHTML = '<span aria-hidden="true">♥</span> Saved';
      actions.append(detailsLink, removeButton);
      info.append(type, title, location, price, meta, actions);
      card.append(imageLink, info);
      list.append(card);
    });
  };

  let favorites = readFavorites();
  updateFavoriteButtons(favorites);
  renderFavorites(favorites);
  window.addEventListener('ehousing:seller-listings-ready', () => {
    updateFavoriteButtons(favorites);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.favorite-btn[data-property-id]');
    if (!button) {
      return;
    }

    const id = button.dataset.propertyId;
    if (!properties[id]) {
      return;
    }
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id];

    if (saveFavorites(nextFavorites)) {
      favorites = nextFavorites;
      updateFavoriteButtons(favorites);
      renderFavorites(favorites);
    }
  });
})();
