import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

// Model names — configurable via env vars, with sensible free-tier defaults
const FLASH_MODEL = process.env.GEMINI_FLASH_MODEL || "gemini-3-flash-preview";
const PRO_MODEL = process.env.GEMINI_PRO_MODEL || "gemini-2.5-flash";
const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

/**
 * Returns a singleton Gemini client instance.
 */
export function getGeminiClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Sleep helper for retry delays.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for Gemini API calls with exponential backoff.
 * Handles 429 (rate limit) and 503 (service unavailable) errors.
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable =
        error.message?.includes("429") ||
        error.message?.includes("503") ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED");

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(
          1000 * Math.pow(2, attempt) + Math.random() * 1000,
          30000,
        );
        console.log(
          `⏳ Rate limited. Retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries})...`,
        );
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}

/**
 * Extracts text content from a document using Gemini's multimodal capabilities.
 * Gemini natively handles PDF, DOCX, TXT, and image files.
 */
export async function extractTextWithGemini(fileBuffer, mimeType, fileName) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: FLASH_MODEL });

  const filePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };

  console.log(
    `📄 Extracting text with ${FLASH_MODEL} from ${fileName} (${mimeType})...`,
  );

  return withRetry(async () => {
    const result = await model.generateContent([
      filePart,
      {
        text: `Extract ALL text content from this document. Preserve the structure including headings, sections, numbered lists, bullet points, and tables. Output the full extracted text faithfully without summarizing or omitting anything. If this is a scanned document or image, perform OCR and extract all visible text.`,
      },
    ]);
    return result.response.text();
  });
}

/**
 * Runs the debate simulation with structured JSON output.
 * Supports streaming for real-time SSE to the frontend.
 */
export async function runDebateStream(
  contractText,
  systemPrompt,
  userPrompt,
  outputSchema,
) {
  const client = getGeminiClient();

  console.log(`🤖 Running debate stream with ${PRO_MODEL}...`);
  console.log(`[DEBUG] systemPrompt length: ${systemPrompt.length}, userPrompt length: ${userPrompt.length}`);

  const model = client.getGenerativeModel({
    model: PRO_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: outputSchema,
      temperature: 0.7,
    },
    systemInstruction: systemPrompt,
  });

  try {
    console.log(`[DEBUG] Calling generateContentStream...`);
    const result = await model.generateContentStream(userPrompt);
    console.log(`[DEBUG] generateContentStream returned. Stream object received.`);
    return result;
  } catch (err) {
    console.error(`[ERROR] generateContentStream failed:`, err);
    throw err;
  }
}

/**
 * Runs the debate simulation (non-streaming) and returns parsed JSON.
 */
export async function runDebate(
  contractText,
  systemPrompt,
  userPrompt,
  outputSchema,
) {
  const client = getGeminiClient();

  console.log(`🤖 Running debate with ${PRO_MODEL}...`);
  console.log(`[DEBUG] systemPrompt length: ${systemPrompt.length}, userPrompt length: ${userPrompt.length}`);

  const model = client.getGenerativeModel({
    model: PRO_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: outputSchema,
      temperature: 0.7,
    },
    systemInstruction: systemPrompt,
  });

  return withRetry(async () => {
    console.log(`[DEBUG] Calling generateContent...`);
    const result = await model.generateContent(userPrompt);
    console.log(`[DEBUG] generateContent returned successfully.`);
    const text = result.response.text();
    return JSON.parse(text);
  });
}

/**
 * Generates an embedding for a clause snippet using Gemini Embeddings.
 */
export async function generateEmbedding(text) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

  return withRetry(async () => {
    const result = await model.embedContent(text);
    return result.embedding.values;
  });
}
