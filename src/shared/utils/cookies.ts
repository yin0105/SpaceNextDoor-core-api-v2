export const getParsedCookies = (request) => {
  const cookies = {};
  if (request?.headers) {
    request?.headers?.cookie?.split(';').forEach((cookie) => {
      const parts = cookie.match(/(.*?)=(.*)$/);
      cookies[parts[1].trim()] = (parts[2] || '').trim();
    });
  }

  return cookies;
};

export const getCookieByKey = (request, key: string): string => {
  const cookies = getParsedCookies(request);
  // eslint-disable-next-line no-restricted-syntax
  console.log('Site Cookies', cookies);
  return cookies[key] || '';
};
