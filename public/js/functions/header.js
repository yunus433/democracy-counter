let User;

function updateLoginState() {
  document.querySelector('.all-header-login-button').style.display = 'none';
  document.querySelector('.all-header-login-info').style.display = 'flex';
  document.querySelector('.all-header-login-info').style.backgroundColor = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');
  document.querySelector('.all-header-login-info').style.color = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');

  document.querySelector('.all-header-login-part').innerHTML = User.side ? 'Party B' : 'Party A';
  document.querySelector('.all-header-login-address').innerHTML = User.public_key;

  if (document.getElementById('notary-wrapper')) {
    document.getElementById('notary-wrapper').style.display = 'flex';

    let card;

    if (User.side)
      card = document.getElementById('opposition-auditor-card');
    else
      card = document.getElementById('state-auditor-card');

    card.style.display = 'flex';
    card.querySelector('.all-content-right-card-name').innerHTML = User.name;
    card.querySelector('.all-content-right-card-address').innerHTML = User.public_key;
    card.querySelector('.all-content-right-card-proof-of-identity-text').innerHTML = User.proof_of_identity;
    card.querySelector('.all-content-right-card-ballot-number').innerHTML = '#' + User.ballot_box_number;

    document.getElementById('notary-side').style.backgroundColor = (User.side ? 'var(--opposition-color)' : 'var(--state-color)');
    document.getElementById('notary-side').innerHTML = 'Notary of the ' + (User.side ? 'Party B' : 'Party A');

    document.querySelector('.all-content-middle-ballot-box-number').innerHTML = '#' + User.ballot_box_number;
  } else {
    document.querySelector('.all-content-audit-button').style.display = 'flex';
  }
};

function getUser() {
  User = getCookie('user');

  if (User) return updateLoginState();
  
  serverRequest('/api/find?public_key=' + Account, 'GET', {}, res => {
    if (res.error) return throwError(res.error);

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