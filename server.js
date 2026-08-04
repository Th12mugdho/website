/* ============================================================
   server.js — minimal backend for RAG_CONFIG.mode = "remote"
   in rag.js.

   What this does:
     1. Receives { question, contextChunks } from the browser
        (contextChunks are the knowledge.js snippets rag.js
        already retrieved client-side).
     2. Sends them to Claude with a system prompt that keeps the
        model grounded in that context only.
     3. Returns { answer, sources } as JSON.

   This turns your chatbot from EXTRACTIVE (returns a knowledge.js
   chunk verbatim) into GENERATIVE (Claude writes a real answer
   using that chunk as context) — same retrieval you already have,
   a real model doing the talking.

   ── Setup ──
     npm install
     cp .env.example .env        # then fill in ANTHROPIC_API_KEY
     npm start                    # runs on http://localhost:3000

   ── Deploy ──
   Any Node host works (Render, Railway, Fly.io, a VPS, etc.).
   Vercel/Netlify also work if you convert this into a serverless
   function instead of a standalone Express app — the request/
   response logic below is the same either way.

   ── Point your site at it ──
   In rag.js, set:
     RAG_CONFIG.mode = "remote";
     RAG_CONFIG.apiEndpoint = "https://your-deployed-url/api/chat";
============================================================ */

import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const app = express();

// Lock CORS down to your actual site's origin(s) once deployed —
// wide-open CORS on a public endpoint is unnecessary exposure.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5500")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "20kb" })); // small limit — this endpoint only ever needs a short question + a few chunks

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Very small in-memory rate limiter (per IP) — good enough to stop
// casual abuse of your API key on a personal portfolio. For real
// production traffic, swap this for something like `express-rate-limit`
// backed by Redis.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW_MS; }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > MAX_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests — please slow down." });
  }
  next();
}

app.post("/api/chat", rateLimit, async (req, res) => {
  try {
    const { question, contextChunks } = req.body || {};

    if (typeof question !== "string" || !question.trim() || question.length > 500) {
      return res.status(400).json({ error: "Invalid question." });
    }
    if (!Array.isArray(contextChunks) || contextChunks.length > 5) {
      return res.status(400).json({ error: "Invalid context." });
    }

    const context = contextChunks
      .map(c => `[${String(c.category || "").slice(0, 60)}] ${String(c.text || "").slice(0, 1000)}`)
      .join("\n");

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system:
        "You are a portfolio assistant for Md. Tasneemul Hassan. " +
        "Answer ONLY using the provided context — never invent facts, dates, or numbers " +
        "that aren't in it. If the context doesn't cover the question, say so plainly and " +
        "suggest emailing Tasneemul directly. Respond in 2–4 sentences, in third person, " +
        "in a clear and professional tone.",
      messages: [
        { role: "user", content: `Context:\n${context || "(no matching context found)"}\n\nQuestion: ${question}` }
      ]
    });

    const answer = msg.content.find(b => b.type === "text")?.text || "I couldn't generate a response — please try again.";

    res.json({
      answer,
      sources: contextChunks.map(c => c.category)
    });
  } catch (err) {
    console.error("[server.js] /api/chat error:", err);
    res.status(500).json({ error: "Something went wrong generating a response." });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RAG backend listening on http://localhost:${PORT}`));
