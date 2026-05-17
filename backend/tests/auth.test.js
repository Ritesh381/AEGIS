import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for the auth middleware.
 * Since the middleware depends on Firebase Admin, we test the logic patterns
 * by simulating request/response objects.
 */

// Simulate the auth middleware logic without importing Firebase
function createAuthMiddleware(isDevMode, verifyToken) {
  return async (req, res, next) => {
    if (req.path === '/health') return next();

    if (isDevMode) {
      req.user = { uid: 'dev-user', email: 'dev@aegis.local' };
      return next();
    }

    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ') || header === 'Bearer null' || header === 'Bearer undefined') {
      req.user = { uid: 'anonymous', email: null };
      return next();
    }

    const idToken = header.split('Bearer ')[1];

    try {
      const decoded = await verifyToken(idToken);
      req.user = decoded;
      next();
    } catch (error) {
      req.user = { uid: 'anonymous', email: null };
      next();
    }
  };
}

describe('Auth Middleware', () => {
  it('should allow health checks without auth', async () => {
    const middleware = createAuthMiddleware(false, () => {});
    const req = { path: '/health', headers: {} };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user, undefined);
  });

  it('should set dev-user in dev mode', async () => {
    const middleware = createAuthMiddleware(true, () => {});
    const req = { path: '/v1/analyze', headers: {} };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'dev-user');
    assert.equal(req.user.email, 'dev@aegis.local');
  });

  it('should set anonymous for missing auth header', async () => {
    const middleware = createAuthMiddleware(false, () => {});
    const req = { path: '/v1/analyze', headers: {} };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'anonymous');
    assert.equal(req.user.email, null);
  });

  it('should set anonymous for "Bearer null"', async () => {
    const middleware = createAuthMiddleware(false, () => {});
    const req = { path: '/v1/analyze', headers: { authorization: 'Bearer null' } };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'anonymous');
  });

  it('should set anonymous for "Bearer undefined"', async () => {
    const middleware = createAuthMiddleware(false, () => {});
    const req = { path: '/v1/analyze', headers: { authorization: 'Bearer undefined' } };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'anonymous');
  });

  it('should verify a valid token', async () => {
    const mockDecoded = { uid: 'user-123', email: 'test@example.com' };
    const middleware = createAuthMiddleware(false, () => mockDecoded);
    const req = { path: '/v1/analyze', headers: { authorization: 'Bearer valid_token_abc' } };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'user-123');
    assert.equal(req.user.email, 'test@example.com');
  });

  it('should set anonymous for an invalid token (instead of 401)', async () => {
    const middleware = createAuthMiddleware(false, () => { throw new Error('Invalid token'); });
    const req = { path: '/v1/analyze', headers: { authorization: 'Bearer bad_token' } };
    let nextCalled = false;
    await middleware(req, {}, () => { nextCalled = true; });
    assert.ok(nextCalled);
    assert.equal(req.user.uid, 'anonymous');
  });
});
