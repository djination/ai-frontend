const SCRIPT_ID = 'google-recaptcha-v3';

/**
 * @param {string} siteKey VITE_RECAPTCHA_SITE_KEY
 * @param {string} [action='register'] reCAPTCHA v3 action name (e.g. register, login)
 * @returns {Promise<string>} token for backend recaptcha_token
 */
export function executeRecaptcha(siteKey, action = 'register') {
  const key = (siteKey || '').trim();
  const act = (action || 'register').trim() || 'register';
  if (!key) {
    return Promise.resolve('');
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(key, { action: act })
          .then(resolve)
          .catch(reject);
      });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(key, { action: act })
          .then(resolve)
          .catch(reject);
      });
    };
    script.onerror = () => reject(new Error('Gagal memuat reCAPTCHA'));
    document.head.appendChild(script);
  });
}
