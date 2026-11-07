(() => {
  const listingsKey = 'ehousingSellerListings';
  const allListings = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(listingsKey) || '[]');
      if (!Array.isArray(saved)) {
        throw new Error('Saved property listings are in an invalid format.');
      }
      return saved.filter((listing) => listing && typeof listing.id === 'string');
    } catch (error) {
      console.error('Could not read seller property listings.', error);
      const alert = document.createElement('p');
      alert.className = 'property-storage-error';
      alert.setAttribute('role', 'alert');
      alert.textContent = 'Saved listings could not be loaded. Enable browser storage and reload this page.';
      document.querySelector('main')?.prepend(alert);
      return [];
    }
  };

  const formattedPrice = (listing) => {
    const price = `₹${Number(listing.price).toLocaleString('en-IN')}`;
    return listing.listing === 'For Rent' ? `${price} / month` : price;
  };

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  };

  const renderCard = (listing, detailed) => {
    const card = createElement('article', 'property-card');
    card.id = listing.id;

    const imageLink = createElement('a', 'property-image');
    imageLink.href = `property-details.html#${encodeURIComponent(listing.id)}`;
    imageLink.setAttribute('aria-label', `View ${listing.title}`);
    const image = document.createElement('img');
    image.src = listing.photo;
    image.alt = `Photo of ${listing.title}`;
    const badge = createElement('span', `badge${listing.listing === 'For Rent' ? ' rent-badge' : ''}`, listing.listing);
    imageLink.append(image, badge);

    const info = createElement('div', 'property-info');
    info.append(
      createElement('p', 'property-type', `${String(listing.type).toUpperCase()} · ${String(listing.city).toUpperCase()}`),
    );

    const title = createElement(detailed ? 'h2' : 'h3');
    const titleLink = createElement('a', '', listing.title);
    titleLink.href = `property-details.html#${encodeURIComponent(listing.id)}`;
    title.append(titleLink);
    info.append(title);

    const favoriteButton = createElement('button', 'favorite-btn', '♡ Add to Favorites');
    favoriteButton.type = 'button';
    favoriteButton.dataset.propertyId = listing.id;
    favoriteButton.setAttribute('aria-pressed', 'false');
    info.append(favoriteButton);
    info.append(createElement('p', 'property-location', `📍 ${listing.location}, ${listing.city}, Karnataka`));
    info.append(createElement('p', 'price', formattedPrice(listing)));

    const meta = createElement('div', 'property-meta');
    meta.append(
      createElement('span', '', `🛏 ${listing.bedrooms} beds`),
      createElement('span', '', `🚿 ${listing.bathrooms} baths`),
      createElement('span', '', `📐 ${Number(listing.area).toLocaleString('en-IN')} sq.ft`)
    );
    info.append(meta);

    if (detailed) {
      info.append(createElement('p', 'detail-description', listing.description));
      const contact = createElement('div', 'seller-contact');
      contact.append(
        createElement('h3', '', 'Seller Contact'),
        createElement('p', '', `Name: ${listing.sellerName}`)
      );
      const phone = createElement('p');
      phone.append(document.createTextNode('Phone: '));
      const phoneLink = createElement('a', '', listing.sellerPhone);
      phoneLink.href = `tel:${listing.sellerPhone.replace(/[^\d+]/g, '')}`;
      phone.append(phoneLink);
      contact.append(phone);
      const email = createElement('p');
      email.append(document.createTextNode('Email: '));
      const emailLink = createElement('a', '', listing.sellerEmail);
      emailLink.href = `mailto:${listing.sellerEmail}`;
      email.append(emailLink);
      contact.append(email);
      contact.append(createElement('p', '', `Property Location: ${listing.location}, ${listing.city}, Karnataka`));
      info.append(contact);

      const isForSale = listing.listing === 'For Sale';
      const holdButton = createElement('a', 'btn hold-property-btn', isForSale ? 'Start Purchase →' : 'Request to Book →');
      holdButton.href = `booking.html?property=${encodeURIComponent(listing.id)}${isForSale ? '&intent=buy' : ''}`;
      info.append(holdButton);
    } else {
      const detailsButton = createElement('a', 'btn full-btn', 'View Details →');
      detailsButton.href = `property-details.html#${encodeURIComponent(listing.id)}`;
      if (sellerGrid) {
        const actions = createElement('div', 'owner-listing-actions');
        const deleteButton = createElement('button', 'delete-listing-btn', 'Delete Listing');
        deleteButton.type = 'button';
        deleteButton.dataset.deleteListingId = listing.id;
        actions.append(detailsButton, deleteButton);
        info.append(actions);
      } else {
        info.append(detailsButton);
      }
    }

    card.append(imageLink, info);
    return card;
  };

  const listings = allListings();
  const query = new URLSearchParams(window.location.search);
  const publishedId = query.get('published');
  if (publishedId) {
    const published = listings.find((listing) => listing.id === publishedId);
    const message = document.querySelector('#listing-published-message');
    if (published && message) {
      message.textContent = `Your property “${published.title}” has been published and saved in this browser.`;
      message.hidden = false;
    }
  }

  const sellerGrid = document.querySelector('#seller-listings-grid');
  if (sellerGrid) {
    const empty = document.querySelector('#seller-listings-empty');
    empty.hidden = listings.length > 0;
    listings.forEach((listing) => sellerGrid.append(renderCard(listing, false)));

    sellerGrid.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('[data-delete-listing-id]');
      if (!deleteButton) {
        return;
      }

      const listingId = deleteButton.dataset.deleteListingId;
      if (!listingId || !window.confirm('Delete this property listing? This cannot be undone.')) {
        return;
      }

      try {
        const savedListings = JSON.parse(window.localStorage.getItem(listingsKey) || '[]');
        if (!Array.isArray(savedListings)) {
          throw new Error('Saved property listings are in an invalid format.');
        }
        const remainingListings = savedListings.filter((listing) => !listing || listing.id !== listingId);
        window.localStorage.setItem(listingsKey, JSON.stringify(remainingListings));
        deleteButton.closest('.property-card').remove();
        empty.hidden = sellerGrid.querySelectorAll('.property-card').length > 0;
      } catch (error) {
        console.error('Could not delete the seller property listing.', error);
        let alert = document.querySelector('.property-storage-error');
        if (!alert) {
          alert = createElement('p', 'property-storage-error', 'This listing could not be deleted. Enable browser storage and try again.');
          alert.setAttribute('role', 'alert');
          sellerGrid.before(alert);
        }
      }
    });
  }

  const listingGrid = document.querySelector('[data-listing-grid]');
  if (listingGrid) {
    const listingType = listingGrid.dataset.listingGrid;
    listings
      .filter((listing) => listing.listing === listingType)
      .forEach((listing) => listingGrid.append(renderCard(listing, false)));
  }

  const detailsGrid = document.querySelector('#property-details-grid');
  if (detailsGrid) {
    listings.forEach((listing) => detailsGrid.append(renderCard(listing, true)));
  }

  window.dispatchEvent(new CustomEvent('ehousing:seller-listings-ready', { detail: { listings } }));
})();
