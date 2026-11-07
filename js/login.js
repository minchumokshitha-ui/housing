(() => {
  const loginForm = document.querySelector('.login-form');
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      window.sessionStorage.setItem('ehousingLoggedIn', 'true');
    } catch (error) {
      console.error('Could not save the E-Housing demo login state.', error);
    }

    window.location.href = 'index.html?login=success';
  });
})();
