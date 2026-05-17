import { Router } from 'express';
import { generateEmbedding } from '../services/gemini.js';
import { db } from '../config/firebase.js';

const router = Router();

/**
 * POST /v1/feedback
 * Accepts user feedback on a flagged clause.
 * Generates an embedding and stores it anonymously for future learning.
 */
router.post('/', async (req, res) => {
  try {
    const { analysis_id, clause_id, feedback_type, comment } = req.body;

    // Validate inputs
    if (!analysis_id || !clause_id || !feedback_type) {
      return res.status(400).json({ error: 'analysis_id, clause_id, and feedback_type are required.' });
    }

    if (!['accurate', 'overstated', 'missed'].includes(feedback_type)) {
      return res.status(400).json({ error: 'feedback_type must be "accurate", "overstated", or "missed".' });
    }

    // Retrieve the clause text from the analysis
    const analysisDoc = await db.collection('analyses').doc(analysis_id).get();
    if (!analysisDoc.exists) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    const analysisData = analysisDoc.data();
    const clause = analysisData.clauses?.find((c) => c.clause_id === clause_id);

    if (!clause) {
      return res.status(404).json({ error: 'Clause not found in the analysis.' });
    }

    // Generate an embedding of the clause text (anonymized — no user ID stored)
    const clauseSnippet = clause.original_text?.slice(0, 500) || '';
    let embedding = [];
    try {
      embedding = await generateEmbedding(clauseSnippet);
    } catch (embError) {
      console.error('Embedding generation failed:', embError.message);
      // Continue without embedding — feedback is still valuable
    }

    // Store anonymized feedback in Firestore
    await db.collection('feedback_embeddings').add({
      clauseSnippet: clauseSnippet.slice(0, 200), // Store only a short snippet
      clauseCategory: clause.risk_category || 'unknown',
      feedbackLabel: feedback_type,
      riskScoreAdjustment: feedback_type === 'overstated' ? -10 : feedback_type === 'missed' ? 10 : 0,
      embedding: embedding,
      comment: comment || null,
      createdAt: new Date().toISOString(),
      // NO user ID or analysis ID stored — fully anonymized
    });

    res.status(204).end();
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to process feedback.' });
  }
});

export default router;
