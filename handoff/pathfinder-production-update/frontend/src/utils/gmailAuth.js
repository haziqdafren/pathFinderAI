import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// In addition to default profiles, require the Gmail Send scope
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

let cachedAccessToken = null;
let isSigningIn = false;

export const initAuth = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignInForGmail = async () => {
  try {
    const isPreviewUrl = window.location.hostname.includes('run.app') || window.location.hostname.includes('googleusercontent');
    if (isPreviewUrl || !firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSy_YOUR_API_KEY_HERE...") {
      // Simulate login for preview environments where domain isn't authorized in Firebase
      cachedAccessToken = "mock_preview_token";
      return { user: { displayName: "Preview User", email: "preview@example.com" }, accessToken: cachedAccessToken };
    }

    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan access token Gmail.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error Google Sign-In:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGmailToken = async () => {
  return cachedAccessToken;
};

export const logoutGmail = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const sendGmailMessage = async (to, subject, htmlBody) => {
  let token = await getGmailToken();
  if (!token) {
    // Attempt dynamic login if no token cached
    const result = await googleSignInForGmail();
    token = result.accessToken;
  }

  if (!token) {
    throw new Error("Gmail API belum terautentikasi. Silakan login ke Google.");
  }

  if (token === "mock_preview_token") {
    console.log(`[Preview Bypass] Simulated sending email to ${to} with subject: ${subject}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return { id: "mock_email_" + Date.now(), status: "SENT_VIA_BYPASS" };
  }

  // Construct standard RFC 2822 email
  // Format subject correctly in Base64 UTF-8 format to handle characters perfectly
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    htmlBody
  ];

  const emailStr = emailLines.join('\r\n');
  const base64Safe = btoa(unescape(encodeURIComponent(emailStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64Safe
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Gagal mengirim email via Gmail API.");
  }

  return await response.json();
};
