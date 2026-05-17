import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { analyzeContract } from '../services/debateEngine.js';
import { db } from '../config/firebase.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Configure multer for file uploads (50MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
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
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported: PDF, DOCX, DOC, TXT, CSV, Markdown, PNG, JPEG, WebP, GIF.`));
    }
  },
});

/**
 * POST /v1/analyze
 * Uploads a document and starts the AEGIS analysis pipeline.
 * Supports SSE streaming if Accept: text/event-stream header is set.
 */
router.post('/', analysisLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const analysisId = `an_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const userId = req.user?.uid || 'anonymous';
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileBuffer = req.file.buffer;

    // Create initial analysis record in Firestore
    await db.collection('analyses').doc(analysisId).set({
      userId,
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      statusMessage: 'Analysis started...',
    });

    // Check if the client wants SSE streaming
    const wantsStream = req.headers.accept?.includes('text/event-stream');

    if (wantsStream) {
      // SSE streaming mode
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Analysis-ID': analysisId,
      });

      // Send initial event
      res.write(`data: ${JSON.stringify({ type: 'started', analysisId })}\n\n`);

      // Run analysis with streaming
      await analyzeContract(fileBuffer, mimeType, fileName, userId, analysisId, res);
    } else {
      // Non-streaming mode — return 202 immediately and process in background
      res.status(202).json({
        analysis_id: analysisId,
        status: 'processing',
        status_url: `/v1/analysis/${analysisId}`,
      });

      // Run analysis in background
      analyzeContract(fileBuffer, mimeType, fileName, userId, analysisId, null).catch((err) => {
        console.error('Background analysis failed:', err);
      });
    }
  } catch (error) {
    console.error('Upload/analyze error:', error);
    if (error.message?.includes('Unsupported file type')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error during analysis.' });
  }
});

/**
 * GET /v1/analysis/:analysisId
 * Retrieves the status and results of an analysis.
 */
router.get('/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const doc = await db.collection('analyses').doc(analysisId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    const data = doc.data();

    // Security check: only the owner can view the analysis
    if (data.userId !== req.user?.uid && data.userId !== 'anonymous') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({
      analysis_id: analysisId,
      status: data.status,
      statusMessage: data.statusMessage,
      overall_risk_score: data.overallRiskScore,
      risk_profile: data.riskProfile,
      summary: data.summary,
      disclaimer: data.disclaimer,
      clauses: data.clauses || [],
      originalFileName: data.originalFileName,
      uploadedAt: data.uploadedAt,
      completedAt: data.completedAt,
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis.' });
  }
});

/**
 * GET /v1/analyses
 * Lists all analyses for the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.uid || 'anonymous';

    // Simple query without orderBy to avoid needing a Firestore composite index.
    // We sort in-memory instead — perfectly fine for <50 docs per user.
    const snapshot = await db
      .collection('analyses')
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const analyses = snapshot.docs
      .map((doc) => ({
        analysis_id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));

    res.json({ analyses });
  } catch (error) {
    console.error('List analyses error:', error);
    res.status(500).json({ error: 'Failed to list analyses.' });
  }
});

export default router;
