import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Mic language codes (match your UI languages)
type MicLang =
  | "auto"
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "gu"
  | "kn"
  | "ml"
  | "pa"
  | "or"
  | "as"
  | "ur";

const VoiceAssistant: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [micLang, setMicLang] = useState<MicLang>("auto");

  // Load available TTS voices
  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // ---------- SPEAK ----------
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Detect script → choose language code
    let lang: string = "en-IN";
    if (/[\u0900-\u097F]/.test(text)) lang = "hi-IN";      // Devanagari (Hindi/Marathi)
    else if (/[\u0980-\u09FF]/.test(text)) lang = "bn-IN"; // Bengali
    else if (/[\u0C00-\u0C7F]/.test(text)) lang = "te-IN"; // Telugu
    else if (/[\u0D80-\u0DFF]/.test(text)) lang = "ta-IN"; // Tamil
    else if (/[\u0A80-\u0AFF]/.test(text)) lang = "gu-IN"; // Gujarati
    else if (/[\u0C80-\u0CFF]/.test(text)) lang = "kn-IN"; // Kannada
    else if (/[\u0D00-\u0D7F]/.test(text)) lang = "ml-IN"; // Malayalam
    else if (/[\u0A00-\u0A7F]/.test(text)) lang = "pa-IN"; // Punjabi
    else if (/[\u0B00-\u0B7F]/.test(text)) lang = "or-IN"; // Odia

    utterance.lang = lang;

    // Try to pick a matching voice if available
    if (voices && voices.length > 0) {
      const base = lang.split("-")[0]; // "hi" from "hi-IN"
      let voice =
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
        voices.find((v) =>
          v.name.toLowerCase().includes("hindi") ||
          v.name.toLowerCase().includes("bengali")
        );

      if (voice) utterance.voice = voice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // ---------- ASK BACKEND ----------
  const askAssistant = async (text: string) => {
    setLoading(true);
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        history: newMessages,
      }),
    });

    const data = await res.json();
    const answer: string = data.answer || "Sorry, I couldn't answer that.";

    setMessages([...newMessages, { role: "assistant", content: answer }]);
    setLoading(false);
    speak(answer);
  };

  // ---------- MIC / STT ----------
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    const uiLang = i18n.language || "en";

    const mapMicLangToLocale = (code: MicLang): string => {
      switch (code) {
        case "en":
          return "en-IN";
        case "hi":
          return "hi-IN";
        case "bn":
          // Many browsers handle bn-BD better than bn-IN
          return "bn-BD";
        case "te":
          return "te-IN";
        case "mr":
          return "mr-IN";
        case "ta":
          return "ta-IN";
        case "gu":
          return "gu-IN";
        case "kn":
          return "kn-IN";
        case "ml":
          return "ml-IN";
        case "pa":
          return "pa-IN";
        case "or":
          return "or-IN";
        case "as":
          return "as-IN";
        case "ur":
          return "ur-IN";
        case "auto":
        default:
          if (uiLang.startsWith("hi")) return "hi-IN";
          if (uiLang.startsWith("bn")) return "bn-BD";
          if (uiLang.startsWith("te")) return "te-IN";
          if (uiLang.startsWith("mr")) return "mr-IN";
          if (uiLang.startsWith("ta")) return "ta-IN";
          if (uiLang.startsWith("gu")) return "gu-IN";
          if (uiLang.startsWith("kn")) return "kn-IN";
          if (uiLang.startsWith("ml")) return "ml-IN";
          if (uiLang.startsWith("pa")) return "pa-IN";
          if (uiLang.startsWith("or")) return "or-IN";
          if (uiLang.startsWith("as")) return "as-IN";
          if (uiLang.startsWith("ur")) return "ur-IN";
          return "en-IN";
      }
    };

    recog.lang = mapMicLangToLocale(micLang);
    recog.interimResults = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);

    recog.onerror = () => {
      setListening(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "There was a problem with speech recognition. Please try again or type your question.",
        },
      ]);
    };

    recog.onresult = (event: any) => {
      const transcript = (event.results[0][0].transcript || "").trim();

      // Ignore very short / unclear audio
      if (!transcript || transcript.length < 2) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't hear that clearly. Please try again or type your question.",
          },
        ]);
        return;
      }

      askAssistant(transcript);
    };

    recog.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    askAssistant(text);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm"
      >
        {open ? "Close" : "Ask EduBetter"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 w-80 max-h-[70vh] bg-white border rounded-xl shadow-lg flex flex-col z-50">
          <div className="px-3 py-2 border-b text-sm font-semibold">
            EduBetter Voice Assistant
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 text-sm space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    m.role === "user"
                      ? "inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      : "inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  }
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-gray-500">Thinking…</p>
            )}
            {!messages.length && !loading && (
              <p className="text-xs text-gray-500">
                Tap the mic or type a question about scholarships, books, or exam dates.
              </p>
            )}
          </div>

          {/* FOOTER: mic controls + input + send */}
          <form
            onSubmit={handleSubmit}
            className="px-3 py-2 border-t flex items-center gap-2"
          >
            {/* Left column: mic language + button (stacked vertically) */}
            <div className="flex flex-col gap-1 items-stretch">
              <select
                className="border rounded px-1 py-[2px] text-[10px] max-w-[110px]"
                value={micLang}
                onChange={(e) => setMicLang(e.target.value as MicLang)}
                title="Mic language"
              >
                <option value="auto">Mic: Auto</option>
                <option value="en">Mic: English</option>
                <option value="hi">Mic: Hindi</option>
                <option value="bn">Mic: Bengali</option>
                <option value="te">Mic: Telugu</option>
                <option value="mr">Mic: Marathi</option>
                <option value="ta">Mic: Tamil</option>
                <option value="gu">Mic: Gujarati</option>
                <option value="kn">Mic: Kannada</option>
                <option value="ml">Mic: Malayalam</option>
                <option value="pa">Mic: Punjabi</option>
                <option value="or">Mic: Odia</option>
                <option value="as">Mic: Assamese</option>
                <option value="ur">Mic: Urdu</option>
              </select>

              <button
                type="button"
                onClick={startListening}
                className={`px-2 py-[2px] rounded text-xs ${
                  listening ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
              >
                🎤
              </button>
            </div>

            {/* Right side: input + send button */}
            <input
              className="flex-1 border rounded px-2 py-1 text-xs"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs whitespace-nowrap"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
