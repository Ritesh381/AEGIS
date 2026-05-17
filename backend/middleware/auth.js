import { auth } from '../config/firebase.js';

const isDevMode = () => process.env.DEV_MODE === 'true';

/**
 * Firebase Auth middleware — verifies the ID token from the Authorization header.
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
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = header.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
