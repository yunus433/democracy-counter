const COOKIE_PREFIX = 'democracy-counter-';
const DEFAULT_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

getCookie = function (cookieName) {
  const name = COOKIE_PREFIX + cookieName + '=';
  const cookies = decodeURIComponent(document.cookie);
  const cookieArray = cookies.split(';').map(each => each.trim());
  let findCookie = cookieArray.find(each => each.indexOf(name) == 0);
  if (findCookie)
    findCookie = JSON.parse(findCookie.substring(name.length));

  return findCookie;
}

setCookie = function (cookieName, cookieValue, cookieMaxAge) {
  if (!cookieMaxAge || !Number.isInteger(cookieMaxAge) || cookieMaxAge < 0)
    cookieMaxAge = DEFAULT_COOKIE_MAX_AGE;

  document.cookie = `${COOKIE_PREFIX}${cookieName}=${JSON.stringify(cookieValue)}; Max-Age=${cookieMaxAge}`;
}

deleteCookie = function (cookieName) {
  setCookie(cookieName, '', 0);
}