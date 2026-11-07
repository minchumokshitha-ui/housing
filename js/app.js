(() => {
  const sessionKey = 'ehousingLoggedIn';
  const loginSucceeded = new URLSearchParams(window.location.search).get('login') === 'success';
  const loginStatus = document.getElementById('login-status');

  if (loginSucceeded) {
    try {
      window.sessionStorage.setItem(sessionKey, 'true');
    } catch (error) {
      console.error('Could not save the E-Housing demo login state.', error);
    }

    if (loginStatus) {
      loginStatus.hidden = false;
    }
  }

  let isLoggedIn = loginSucceeded;
  if (!isLoggedIn) {
    try {
      isLoggedIn = window.sessionStorage.getItem(sessionKey) === 'true';
    } catch (error) {
      console.error('Could not read the E-Housing demo login state.', error);
    }
  }

  const updateAccountControls = () => {
    const navButtons = document.querySelector('.nav-buttons');
    if (!navButtons) {
      return;
    }

    const loginLink = navButtons.querySelector('.login-btn');
    const registerLink = navButtons.querySelector('.btn-small');
    let logoutButton = navButtons.querySelector('.logout-btn');

    if (loginLink) {
      loginLink.hidden = isLoggedIn;
    }
    if (registerLink) {
      registerLink.hidden = isLoggedIn;
    }

    let accountIndicator = navButtons.querySelector('.account-indicator');
    if (isLoggedIn && !accountIndicator) {
      accountIndicator = document.createElement('span');
      accountIndicator.className = 'account-indicator';
      accountIndicator.setAttribute('aria-label', 'Logged in');
      accountIndicator.innerHTML = '<span aria-hidden="true">👤</span> Signed in';
      navButtons.append(accountIndicator);
    } else if (!isLoggedIn && accountIndicator) {
      accountIndicator.remove();
    }

    if (isLoggedIn && !logoutButton) {
      logoutButton = document.createElement('button');
      logoutButton.className = 'logout-btn';
      logoutButton.type = 'button';
      logoutButton.textContent = 'Log out';
      logoutButton.addEventListener('click', () => {
        try {
          window.sessionStorage.removeItem(sessionKey);
        } catch (error) {
          console.error('Could not clear the E-Housing demo login state.', error);
        }
        window.location.href = 'index.html';
      });
      navButtons.append(logoutButton);
    }
  };

  updateAccountControls();
})();
