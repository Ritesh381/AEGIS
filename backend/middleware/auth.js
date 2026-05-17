import { auth } from '../config/firebase.js';

const isDevMode = () => process.env.DEV_MODE === 'true';

/**
 * Firebase Auth middleware — verifies the ID token from the Authorization header.
 * Authentication is OPTIONAL: unauthenticated requests proceed as 'anonymous'.
 * In DEV_MODE, bypasses auth and sets a mock user for local testing.
 */
export const authenticateUser = async (req, res, next) => {
  // Allow health checks through without auth
  if (req.path === '/health') return next();

  // Dev mode bypass — allows testing without Firebase Auth configured
  if (isDevMode()) {
    req.user = { uid: 'dev-user', email: 'dev@aegis.local' };
    return next();
  }

  const header = req.headers.authorization;

  // No token provided — allow as anonymous guest
  if (!header || !header.startsWith('Bearer ') || header === 'Bearer null' || header === 'Bearer undefined') {
    req.user = { uid: 'anonymous', email: null };
    return next();
  }

  const idToken = header.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Token is invalid/expired — still allow as anonymous rather than blocking
    console.warn('Auth token invalid, proceeding as anonymous:', error.message);
    req.user = { uid: 'anonymous', email: null };
    next();
  }
};
