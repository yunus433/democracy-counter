let User;

function updateLoginState() {
  document.querySelector('.all-header-login-button').style.display = 'none';
  document.querySelector('.all-header-login-info').style.display = 'flex';
  document.querySelector('.all-header-login-info').style.backgroundColor = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');
  document.querySelector('.all-header-login-info').style.color = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');

  document.querySelector('.all-header-login-part').innerHTML = User.side ? 'Opposition' : 'State';
  document.querySelector('.all-header-login-address').innerHTML = User.public_key;
};

function getUser() {
  User = getCookie('user');

  if (User) return updateLoginState();
  
  serverRequest('/api/find?public_key=' + Account, 'GET', {}, res => {
    if (res.error) return alert('Error: ' + res.error);

    User = res.user;

    setCookie('user', User);
    updateLoginState();
  });
}

async function checkUser() {
  if (getCookie('user')) {
    await connectMetaMask();
    User = getCookie('user');
    updateLoginState();
  }
}

function logout() {
  deleteCookie('user');
  window.location.reload();
}

window.addEventListener('load', async () => {
  checkUser();

  document.addEventListener('click', async event => {
    if (ancestorWithClassName(event.target, 'all-header-login-button')) {
      await connectMetaMask();
      getUser();
    }

    if (ancestorWithClassName(event.target, 'all-header-login-info')) {
      createConfirm({
        title: 'Are you sure you want to logout?',
        text: 'You can always login again.',
        reject: 'Cancel',
        accept: 'Logout',
      }, res => {
        if (res) {
          logout();
        }
      });
    }
  });
});