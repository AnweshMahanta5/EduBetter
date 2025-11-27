import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ------------------------------------
// Load EduBetter data
// ------------------------------------
function loadJson(relativePath: string) {
  const fullPath = path.join(__dirname, "..", relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
}

const schemes = loadJson("src/data/schemes.json");
const books = loadJson("src/data/books.json");
const stateBoards = loadJson("src/data/stateBoards.json");
const examDates = loadJson("public/data/examDates.json");

// Language code -> human label
const LANG_LABEL_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  or: "Odia",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  ta: "Tamil",
};

// ------------------------------------
// 1) Script-based quick detector
// ------------------------------------
function detectLanguageByScript(text: string): string | null {
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari (Hindi/Marathi)
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu"; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa"; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return "or"; // Odia
  if (/[\u0C00-\u0C7F]/.test(text)) return "te"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml"; // Malayalam
  if (/[\u0D80-\u0DFF]/.test(text)) return "ta"; // Tamil

  return null; // no clear script
}

// ------------------------------------
// 2) Gemini-based detector for Latin text
//    (handles romanised Hindi etc.)
// ------------------------------------
async function detectLanguageWithGemini(question: string): Promise<string> {
  const quick = detectLanguageByScript(question);
  if (quick) return quick;

  const detectorModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `
You are a language detection tool.

Given the user's text, respond with ONLY a two-letter ISO 639-1 language code
from this list: en, hi, bn, gu, pa, or, te, kn, ml, ta.

Rules:
- If the text is proper English, respond "en".
- If the text is Hindi, including romanized Hindi written in Latin letters
  like "mujhe scholarship ke bare me" or "tum kaun ho", respond "hi".
- If the text mixes English and Hindi but mostly Hindi, respond "hi".
- If the text is mostly English with a few Indian words, respond "en".

Text:
"""${question}"""
`.trim();

  const result = await detectorModel.generateContent([{ text: prompt }]);
  const raw = (await result.response.text()).trim().toLowerCase();

  // Take just first token, make sure it's valid
  const code = raw.split(/[^a-z]/)[0]; // first word-like token
  const allowed = Object.keys(LANG_LABEL_MAP);
  if (allowed.includes(code)) return code;

  return "en"; // safe fallback
}

// ------------------------------------
// 3) Find relevant EduBetter data
// ------------------------------------
function findRelevant(question: string) {
  const q = question.toLowerCase();

  const relevantSchemes = schemes
    .filter((s: any) => JSON.stringify(s).toLowerCase().includes(q))
    .slice(0, 5);

  const relevantBooks = books
    .filter((b: any) => JSON.stringify(b).toLowerCase().includes(q))
    .slice(0, 5);

  const relevantExams = examDates
    .filter((e: any) => JSON.stringify(e).toLowerCase().includes(q))
    .slice(0, 5);

  return { relevantSchemes, relevantBooks, relevantExams };
}

// ------------------------------------
// 4) Main assistant endpoint
// ------------------------------------
app.post("/api/assistant", async (req: Request, res: Response) => {
  try {
    const { question, history = [] } = req.body || {};
    if (!question) {
      return res.status(400).json({ answer: "No question provided." });
    }

    const { relevantSchemes, relevantBooks, relevantExams } =
      findRelevant(question);

    // Detect language (script + Gemini)
    const langCode = await detectLanguageWithGemini(question);
    const langLabel = LANG_LABEL_MAP[langCode] || "English";

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are the EduBetter multilingual assistant for Indian school students.

ABOUT_EDUBETTER:
EduBetter helps Indian school students discover:
• government & private scholarships,
• free textbooks by board and class,
• and board exam dates (CBSE, ICSE, State Boards).

You are a friendly AI guide.

LANGUAGE RULE:
- The user's question language is: ${langLabel} (code: ${langCode}).
- ALWAYS answer ONLY in ${langLabel}.
- Never mix languages in one answer.
- If the language is Hindi (hi), always answer in NATURAL Hindi using
  Devanagari script, even if the user wrote Hindi using Latin letters
  (Hinglish) like "aap kaun ho" or "mujhe scholarship ke bare me batao".
- If the language is English (en), answer in English.
- If the language is another Indian language (bn, gu, pa, or, te, kn, ml, ta),
  answer in that language's normal script.

ANSWERING RULES:
1. If the user asks general questions like:
   - "tell me something about scholarships"
   - "where can I get scholarships"
   - "how to apply for scholarships"
   - "what does EduBetter do"
   Use ABOUT_EDUBETTER and your general knowledge to explain in simple words,
   in the detected language.

2. For specific lookups (class, state, board, subject), use the structured DATA below.

3. ONLY if the user asks for a specific scholarship / book / exam detail
   that is NOT present in the DATA, reply:
   "This information is not available on EduBetter yet."

DATA:
SCHEMES:
${JSON.stringify(relevantSchemes).slice(0, 4000)}

BOOKS:
${JSON.stringify(relevantBooks).slice(0, 4000)}

EXAM_DATES:
${JSON.stringify(relevantExams).slice(0, 4000)}

USER QUESTION:
${question}
`.trim();

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.json({ answer: "Sorry, there was an error talking to Gemini." });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`EduBetter Assistant API running on http://localhost:${PORT}`);
});
