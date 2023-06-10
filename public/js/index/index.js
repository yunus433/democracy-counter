let User;

function updateLoginState() {
  document.querySelector('.all-header-login-button').style.display = 'none';
  document.querySelector('.all-header-login-info').style.display = 'flex';
  document.querySelector('.all-header-login-info').style.backgroundColor = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');
  document.querySelector('.all-header-login-info').style.color = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');

  document.querySelector('.all-header-login-part').innerHTML = User.side ? 'Opposition' : 'State';
  document.querySelector('.all-header-login-address').innerHTML = User.public_key;
}

function getUser() {
  serverRequest('/api/find?public_key=' + Account, 'GET', {}, res => {
    if (res.error) return alert('Error: ' + res.error);

    User = res.user;

    updateLoginState();
  });
}

window.addEventListener('load', async () => {
  document.addEventListener('click', async event => {
    if (ancestorWithClassName(event.target, 'all-header-login-button')) {
      await connectMetaMask();
      getUser();
    }
  });
});