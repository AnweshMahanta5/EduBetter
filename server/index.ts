import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------
// Gemini setup
// ------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set. EduBetter assistant replies will fail.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

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
  mr: "Marathi",
  as: "Assamese",
  ur: "Urdu",
};

// ------------------------------------
// 1) Script-based detector
// ------------------------------------
function detectLanguageByScript(text: string): string | null {
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari (Hindi/Marathi/etc.)
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali/Assamese
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu"; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa"; // Gurmukhi (Punjabi)
  if (/[\u0B00-\u0B7F]/.test(text)) return "or"; // Odia
  if (/[\u0C00-\u0C7F]/.test(text)) return "te"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml"; // Malayalam
  if (/[\u0D80-\u0DFF]/.test(text)) return "ta"; // Tamil
  if (/[\u0600-\u06FF]/.test(text)) return "ur"; // Arabic script (Urdu)
  return null;
}

// ------------------------------------
// 2) Lightweight offline language detector
//    (handles Hinglish / romanised forms)
// ------------------------------------
function detectLanguage(question: string): string {
  const byScript = detectLanguageByScript(question);
  if (byScript) return byScript;

  const lower = question.toLowerCase();

  // Very rough Hinglish patterns → treat as Hindi
  const romanHindiPatterns = [
    "mujhe ",
    "mujko ",
    "tum ",
    "tumhara",
    "aap ",
    "kaun ho",
    "kya hai",
    "kyu ",
    "kyun ",
    "batao",
    "ke bare me",
    "ke baare me",
    "scholarship ke bare",
    "scholarship ke baare",
  ];

  if (romanHindiPatterns.some((p) => lower.includes(p))) {
    return "hi";
  }

  // Simple roman Bengali hint (totally optional)
  const romanBengaliPatterns = [
    "ami ",
    "tumi ",
    "tomar ",
    "kichu ",
    "jante chai",
    "jante chahi",
  ];
  if (romanBengaliPatterns.some((p) => lower.includes(p))) {
    return "bn";
  }

  // Simple roman Tamil hint
  const romanTamilPatterns = [
    "enna ",
    "enaku ",
    "enakku ",
    "enakku scholarship",
    "scholarship patri",
    "scholarship pathi",
    "scholarship patti",
    "eppadi",
  ];
  if (romanTamilPatterns.some((p) => lower.includes(p))) {
    return "ta";
  }

  return "en"; // default
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
    const { question } = req.body || {};
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.json({
        answer:
          "I couldn't hear anything. Please try again or type your question.",
      });
    }

    const cleanQuestion = question.trim();
    const { relevantSchemes, relevantBooks, relevantExams } =
      findRelevant(cleanQuestion);

    const langCode = detectLanguage(cleanQuestion);
    const langLabel = LANG_LABEL_MAP[langCode] || "English";

    if (!apiKey) {
      return res.json({
        answer:
          "The EduBetter assistant is not configured with an API key yet, so I can't answer right now.",
      });
    }

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
- If the language is Hindi (hi), answer in natural Hindi using Devanagari script,
  even if the user wrote in Latin letters (Hinglish).
- If the language is English (en), answer in English.
- For other codes (bn, gu, pa, or, te, kn, ml, ta, mr, as, ur) answer in that language's normal script.

ANSWERING RULES:
1. If the user asks general questions like:
   - "tell me something about scholarships"
   - "where can I get scholarships"
   - "how to apply for scholarships"
   - "what does EduBetter do"
   Use ABOUT_EDUBETTER and your general knowledge to explain in simple words,
   in the detected language.

2. If the user asks about scholarships in general (without a very specific scheme name),
   or the question is a bit vague (for example "scholarship uplabdhi biswas janna chaho",
   "scholarship ke bare me batao"), treat it as a general question and give a helpful,
   high-level explanation about how scholarships work and how EduBetter can help.

3. If the user clearly mentions a specific named scholarship and that scholarship
   (or a very similar name) appears in SCHEMES, then:
   - Describe that scholarship in simple language.
   - Mention who it is for (class, category, state) and key benefits.
   - Tell the student how they can apply (from the data if available).

4. ONLY if the user clearly asks for a specific scholarship / book / exam detail
   that is NOT present in the DATA, then:
   - First, say this one line in the detected language:
     "This information is not available on EduBetter yet."
   - THEN, in the same answer, add 2-3 helpful sentences suggesting what the student
     can do next (for example: check the National Scholarship Portal, state scholarship
     portal, official board/college website, or ask a teacher), instead of stopping
     at just that one line.

DATA:
SCHEMES:
${JSON.stringify(relevantSchemes).slice(0, 4000)}

BOOKS:
${JSON.stringify(relevantBooks).slice(0, 4000)}

EXAM_DATES:
${JSON.stringify(relevantExams).slice(0, 4000)}

USER QUESTION:
${cleanQuestion}
`.trim();

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (err: any) {
    console.error("❌ EduBetter assistant error:", err);
    let message =
      "Sorry, I had a technical problem while talking to Gemini. Please try again in a moment.";

    if (err && typeof err === "object" && "message" in err) {
      const msg = String((err as any).message || "");
      if (msg.toLowerCase().includes("api key")) {
        message =
          "The EduBetter assistant's API key seems to be misconfigured. Please ask the maintainer to check GEMINI_API_KEY.";
      }
      if (msg.toLowerCase().includes("rate") && msg.toLowerCase().includes("limit")) {
        message =
          "I'm getting a lot of requests right now and hit the rate limit. Please wait a bit and try again.";
      }
    }

    res.json({ answer: message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`EduBetter Assistant API running on http://localhost:${PORT}`);
});
