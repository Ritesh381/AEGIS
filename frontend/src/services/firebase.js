import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase is properly configured.
 * If not (placeholder values), we run in dev/demo mode.
 */
const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_firebase_api_key' &&
    !firebaseConfig.apiKey.startsWith('your_')
  );
};

export const DEV_MODE = !isFirebaseConfigured();

let app = null;
let authInstance = null;

if (!DEV_MODE) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export const auth = authInstance;

const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = (email, password) => {
  if (DEV_MODE) return Promise.resolve({ user: { uid: 'dev-user', email } });
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = (email, password) => {
  if (DEV_MODE) return Promise.resolve({ user: { uid: 'dev-user', email } });
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  if (DEV_MODE) return Promise.resolve({ user: { uid: 'dev-user', email: 'dev@aegis.local' } });
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
  if (DEV_MODE) return Promise.resolve();
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (DEV_MODE) {
    // In dev mode, don't auto-sign-in — let the user click login
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Gets the current user's ID token for API calls.
 * In dev mode, returns null (backend also bypasses auth).
 */
export const getIdToken = async () => {
  if (DEV_MODE) return null;
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

export default app;
