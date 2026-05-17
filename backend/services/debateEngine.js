import { extractTextWithGemini, runDebateStream, runDebate } from './gemini.js';
import { ORCHESTRATOR_SYSTEM_PROMPT, DEBATE_USER_PROMPT, OUTPUT_SCHEMA } from '../prompts/agents.js';
import { db } from '../config/firebase.js';

/**
 * Runs the full AEGIS analysis pipeline:
 * 1. Extract text from the uploaded document using Gemini's native multimodal capabilities.
 * 2. Run the simulated multi-agent debate using Gemini 2.5 Pro.
 * 3. Store the results in Firestore.
 * 4. (Optional) Stream results via SSE.
 */
export async function analyzeContract(fileBuffer, mimeType, fileName, userId, analysisId, res) {
  try {
    // Update status to "extracting"
    await updateStatus(analysisId, 'extracting', 'Extracting text from document...');

    // Step 1: Extract text using Gemini multimodal
    let contractText;
    try {
      contractText = await extractTextWithGemini(fileBuffer, mimeType, fileName);
    } catch (extractError) {
      console.error('Gemini extraction failed, document may be unsupported:', extractError.message);
      await updateStatus(analysisId, 'failed', 'Failed to extract text from document.');
      return null;
    }

    if (!contractText || contractText.trim().length < 50) {
      await updateStatus(analysisId, 'failed', 'Could not extract sufficient text from the document.');
      return null;
    }

    // Update status to "debating"
    await updateStatus(analysisId, 'debating', 'AI agents are analyzing clauses...');

    // Step 2: Run the simulated debate
    if (res) {
      // SSE streaming mode
      return await runStreamingDebate(contractText, analysisId, userId, fileName, res);
    } else {
      // Non-streaming mode
      return await runNonStreamingDebate(contractText, analysisId, userId, fileName);
    }
  } catch (error) {
    console.error('Analysis pipeline error:', error);
    await updateStatus(analysisId, 'failed', `Analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Streaming debate — sends SSE events to the client as Gemini generates tokens.
 */
async function runStreamingDebate(contractText, analysisId, userId, fileName, res) {
  const prompt = DEBATE_USER_PROMPT(contractText);

  try {
    const stream = await runDebateStream(contractText, ORCHESTRATOR_SYSTEM_PROMPT, prompt, OUTPUT_SCHEMA);

    let fullText = '';
    let chunkCount = 0;

    console.log(`[DEBUG] Starting to consume stream...`);
    for await (const chunk of stream.stream) {
      chunkCount++;
      if (chunkCount === 1) console.log(`[DEBUG] Received first stream chunk.`);
      
      const chunkText = chunk.text();
      fullText += chunkText;

      // Send SSE event with the chunk
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunkText })}\n\n`);
      }
    }
    console.log(`[DEBUG] Stream fully consumed. Total chunks: ${chunkCount}`);

    // Parse the complete result
    let analysis;
    try {
      analysis = JSON.parse(fullText);
    } catch {
      // If JSON parsing fails on the full stream, try to extract JSON
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse debate output as JSON');
      }
    }

    // Save to Firestore
    await saveAnalysis(analysisId, userId, fileName, analysis);

    // Send final SSE event
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'complete', analysisId, analysis })}\n\n`);
      res.end();
    }

    return analysis;
  } catch (error) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
    await updateStatus(analysisId, 'failed', error.message);
    return null;
  }
}

/**
 * Non-streaming debate — returns the full result at once.
 */
async function runNonStreamingDebate(contractText, analysisId, userId, fileName) {
  const prompt = DEBATE_USER_PROMPT(contractText);
  const analysis = await runDebate(contractText, ORCHESTRATOR_SYSTEM_PROMPT, prompt, OUTPUT_SCHEMA);

  await saveAnalysis(analysisId, userId, fileName, analysis);
  return analysis;
}

/**
 * Saves the completed analysis to Firestore.
 */
async function saveAnalysis(analysisId, userId, fileName, analysis) {
  await db.collection('analyses').doc(analysisId).set({
    userId,
    originalFileName: fileName,
    uploadedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
    overallRiskScore: analysis.overall_risk_score,
    riskProfile: analysis.risk_profile,
    summary: analysis.summary,
    disclaimer: analysis.disclaimer,
    clauses: analysis.clauses || [],
  }, { merge: true });
}

/**
 * Updates analysis status in Firestore.
 */
async function updateStatus(analysisId, status, message) {
  try {
    await db.collection('analyses').doc(analysisId).set({
      status,
      statusMessage: message,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to update status:', err.message);
  }
}
