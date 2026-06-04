export async function oauthRedirect(){
  await _generateCodeVerifier();
  const codeChallenge = await _generateCodeChallenge();
  const state = _generateState();
  
  // 🔥 ИСПРАВЛЕНИЕ: Добавляем PUBLIC_URL для GitHub Pages
  const redirectUri = `${window.location.origin}${process.env.PUBLIC_URL || ''}`;
  
  const clientId = process.env.REACT_APP_TPU_OAUTH_CLIENT_ID;
  if (!clientId) {
    console.error('REACT_APP_TPU_OAUTH_CLIENT_ID не найдена');
    return;
  }
  
  const authUrl = `https://oauth.tpu.ru/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  console.log('🔐 Redirect URL:', authUrl);
  window.location.href = authUrl;
}

/**
 * Генерирует Code Verifier для протокола PKCE и сохраняет его в sessionStorage
 * @returns {Promise<string>} Promise, который разрешается в сгенерированный Code Verifier
 */
async function _generateCodeVerifier() {
  const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const byteLength = Math.ceil(length * Math.log2(64) / 8);
  const randomBytes = await _generateRandomBytes(byteLength);
  const array = new Uint8Array(randomBytes);
  let codeVerifier = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = array[i % array.length] % allowedChars.length;
    codeVerifier += allowedChars[randomIndex];
  }
  
  sessionStorage.setItem('code_verifier', codeVerifier);
}

function _getCodeVerifier() {
  return sessionStorage.getItem('code_verifier');
}

function _clearCodeVerifier() {
  sessionStorage.removeItem('code_verifier');
}

async function _generateCodeChallenge() {
  let codeVerifier = _getCodeVerifier();
  
  if (typeof codeVerifier !== 'string') {
    throw new Error('codeVerifier должен быть строкой');
  }
  
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Криптографическое API недоступно в текущем браузере');
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    
    const arrayBuffer = new Uint8Array(digest);
    let base64String = btoa(String.fromCharCode.apply(null, arrayBuffer));
    
    const base64Url = base64String
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return base64Url;
  } catch (error) {
    throw new Error('Ошибка при генерации code_challenge: ' + error.message);
  }
}

async function _generateRandomBytes(length) {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  }
  throw new Error('Не удалось найти способ генерации случайных байтов');
}

function _generateState() {
  try {
    if (!window.crypto || !window.crypto.getRandomValues) {
      throw new Error("Crypto API недоступно в браузере");
    }
    const array = new Uint8Array(48);
    window.crypto.getRandomValues(array);

    const state = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    sessionStorage.setItem('oauth_state', state);
    return state;
  } catch (error) {
    console.error("Ошибка генерации OAuth state:", error);
    return null;
  }
}

export function oauthCodeHandler(query) {
  try {
    const searchParams = new URLSearchParams(query);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const codeVerifier = _getCodeVerifier();
    
    if (code && state && codeVerifier) {
      if (state === _getState()) {
        _clearState();
        _clearCodeVerifier();
        return {
          code: code,
          codeVerifier: codeVerifier,
        };
      }
      console.error('State mismatch');
      return null;
    }
    return null;
  } catch (err) {
    console.error("Ошибка OAuth state:", err);
    return null;
  }
}

function _getState() {
  return sessionStorage.getItem('oauth_state');
}

function _clearState() {
  sessionStorage.removeItem('oauth_state');
}