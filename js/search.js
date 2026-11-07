(() => {
  const normalize = (value) => value.toLocaleLowerCase().trim();

  const searchForm = document.querySelector('[data-property-search]');
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(searchForm);
      const listing = formData.get('listing') === 'rent' ? 'rent.html' : 'buy.html';
      const params = new URLSearchParams();
      params.set('listing', formData.get('listing'));

      const location = String(formData.get('location') || '').trim();
      const type = String(formData.get('type') || '').trim();
      if (location) {
        params.set('location', location);
      }
      if (type) {
        params.set('type', type);
      }

      window.location.href = `${listing}?${params.toString()}`;
    });
  }

  const grid = document.querySelector('[data-listing-grid]');
  if (!grid) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const locationQuery = normalize(params.get('location') || '');
  const typeQuery = normalize(params.get('type') || '');
  const results = document.querySelector('[data-search-results]');
  const emptyState = document.querySelector('[data-search-empty]');
  const cards = Array.from(grid.querySelectorAll('.property-card'));

  if (!locationQuery && !typeQuery) {
    return;
  }

  const typeMatches = (card) => {
    if (!typeQuery) {
      return true;
    }

    const typeText = normalize(card.querySelector('.property-type')?.textContent || '');
    if (typeQuery === 'house') {
      return typeText.includes('house');
    }
    return typeText.includes(typeQuery);
  };

  const locationMatches = (card) => {
    if (!locationQuery) {
      return true;
    }

    const searchText = normalize([
      card.querySelector('.property-type')?.textContent,
      card.querySelector('h2, h3')?.textContent,
      card.querySelector('.property-location')?.textContent
    ].filter(Boolean).join(' '));
    return locationQuery.split(/\s+/).every((term) => searchText.includes(term));
  };

  const matchingCards = cards.filter((card) => typeMatches(card) && locationMatches(card));
  cards.forEach((card) => {
    card.hidden = !matchingCards.includes(card);
  });

  if (results) {
    const listingName = params.get('listing') === 'rent' ? 'for rent' : 'for sale';
    const filters = [typeQuery, locationQuery].filter(Boolean).join(' in ');
    results.textContent = `Found ${matchingCards.length} ${matchingCards.length === 1 ? 'home' : 'homes'} ${listingName}${filters ? ` matching "${filters}"` : ''}.`;
    results.hidden = false;
  }
  if (emptyState) {
    emptyState.hidden = matchingCards.length > 0;
  }
})();
