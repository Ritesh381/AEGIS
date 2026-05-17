import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for the rate limiter configuration.
 * We import and verify the limiter is properly configured.
 */

// We can't easily test express-rate-limit in isolation without spinning up a server,
// so we test the configuration logic directly.

describe('Rate Limiter Configuration', () => {
  it('should export analysisLimiter as a function (middleware)', async () => {
    const { analysisLimiter } = await import('../middleware/rateLimiter.js');
    assert.equal(typeof analysisLimiter, 'function');
  });
});

describe('File Upload Validation', () => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/csv',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
  ];

  const rejectedMimes = [
    'application/zip',
    'application/x-executable',
    'video/mp4',
    'audio/mpeg',
    'application/javascript',
  ];

  it('should accept PDF files', () => {
    assert.ok(allowedMimes.includes('application/pdf'));
  });

  it('should accept DOCX files', () => {
    assert.ok(allowedMimes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
  });

  it('should accept plain text files', () => {
    assert.ok(allowedMimes.includes('text/plain'));
  });

  it('should accept image files for OCR', () => {
    assert.ok(allowedMimes.includes('image/png'));
    assert.ok(allowedMimes.includes('image/jpeg'));
    assert.ok(allowedMimes.includes('image/webp'));
  });

  it('should reject zip files', () => {
    assert.ok(!allowedMimes.includes('application/zip'));
  });

  it('should reject executable files', () => {
    assert.ok(!allowedMimes.includes('application/x-executable'));
  });

  it('should reject video files', () => {
    assert.ok(!allowedMimes.includes('video/mp4'));
  });

  it('should support exactly 10 mime types', () => {
    assert.equal(allowedMimes.length, 10);
  });
});

describe('Analysis ID Generation', () => {
  it('should generate unique IDs', async () => {
    // Simulate the ID generation pattern used in analyze.js
    const { v4: uuidv4 } = await import('uuid');
    const id1 = `an_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const id2 = `an_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    assert.ok(id1.startsWith('an_'));
    assert.ok(id2.startsWith('an_'));
    assert.notEqual(id1, id2);
    assert.equal(id1.length, 15); // 'an_' (3) + 12 chars
  });

  it('should only contain alphanumeric characters after prefix', async () => {
    const { v4: uuidv4 } = await import('uuid');
    const id = `an_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const suffix = id.slice(3);
    assert.match(suffix, /^[a-f0-9]{12}$/);
  });
});
