/* ============================================================
   rag.js — retrieval + chat wiring for the "ASK.TH" widget.

   Works two ways, controlled by RAG_CONFIG.mode below:

   • "local"  (default, zero setup): scores window.KNOWLEDGE_BASE
     chunks against the question with a lightweight keyword/TF
     scorer, then returns the best-matching chunk(s) directly.
     This is genuine retrieval — nothing is hard-coded per
     question — but the *answer* is extractive (the matched
     chunk's own text), not freshly generated.

   • "remote" (bring your own backend): posts { question,
     contextChunks } to RAG_CONFIG.apiEndpoint and expects back
     { answer, sources }. Point this at a small server that calls
     a real LLM with the retrieved chunks as context for fully
     generated answers. See the Node/Express sketch at the very
     bottom of this file.
============================================================ */

const RAG_CONFIG = {
  mode: "local",              // "local" | "remote"
  apiEndpoint: "/api/chat",   // used only when mode === "remote"
  topK: 2,                    // how many chunks to retrieve
  minScore: 0.5                // below this, fall back to a "not sure" reply
};

(function(){
  const STOPWORDS = new Set(["a","an","the","is","are","was","were","do","does","did","what","who","where","when","how","why","in","on","of","for","to","and","or","your","you","his","her","he","she","it","tell","me","about","can","i","my","please","did","have","has"]);

  function tokenize(str){
    return (str.toLowerCase().match(/[a-z0-9+#]+/g) || []).filter(w => !STOPWORDS.has(w) && w.length > 1);
  }

  // Simple scorer: keyword hits (weighted higher) + raw word overlap
  // against the chunk body. No external libraries, no network call —
  // this runs entirely client-side so the demo works with zero setup.
  function retrieve(question, topK){
    const qTokens = tokenize(question);
    if (!qTokens.length) return [];
    const scored = window.KNOWLEDGE_BASE.map(chunk => {
      let score = 0;
      const bodyTokens = tokenize(chunk.text);
      qTokens.forEach(qt => {
        if (chunk.keywords.some(k => k.toLowerCase().includes(qt) || qt.includes(k.toLowerCase()))) score += 2;
        if (bodyTokens.includes(qt)) score += 1;
      });
      return { chunk, score };
    });
    return scored
      .filter(s => s.score >= RAG_CONFIG.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => s.chunk);
  }

  async function answerRemote(question, chunks){
    const res = await fetch(RAG_CONFIG.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, contextChunks: chunks })
    });
    if (!res.ok) throw new Error("Backend error " + res.status);
    return res.json(); // expects { answer, sources? }
  }

  function answerLocal(question, chunks){
    if (!chunks.length){
      return {
        answer: "I don't have anything on that in my knowledge base yet — try asking about Payra, MechaHex, his publications, leadership roles, or how to get in touch.",
        sources: []
      };
    }
    const answer = chunks.map(c => c.text).join(" ");
    return { answer, sources: chunks.map(c => c.category) };
  }

  // ---------------- UI wiring ----------------
  const body = document.getElementById("chatBody");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  if (!form) return; // chat widget not present on this page

  function appendMessage(text, role, sources){
    const el = document.createElement("div");
    el.className = "chat-msg" + (role === "user" ? " user" : "");
    el.textContent = text;
    if (sources && sources.length){
      const row = document.createElement("div");
      row.className = "src-row";
      [...new Set(sources)].forEach(s => {
        const chip = document.createElement("span");
        chip.className = "src-chip";
        chip.textContent = s;
        row.appendChild(chip);
      });
      el.appendChild(row);
    }
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function appendTyping(){
    const el = document.createElement("div");
    el.className = "chat-msg chat-typing-wrap";
    el.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    appendMessage(question, "user");
    input.value = "";
    sendBtn.disabled = true;

    const chunks = retrieve(question, RAG_CONFIG.topK);
    const typingEl = appendTyping();

    try {
      let result;
      if (RAG_CONFIG.mode === "remote"){
        result = await answerRemote(question, chunks);
      } else {
        // tiny artificial delay so the typing indicator is perceptible
        await new Promise(r => setTimeout(r, 450));
        result = answerLocal(question, chunks);
      }
      typingEl.remove();
      appendMessage(result.answer, "bot", result.sources);
    } catch (err){
      typingEl.remove();
      appendMessage("Local retrieval hit a snag — check the console for details.", "bot");
      console.error("[rag.js]", err);
    } finally {
      sendBtn.disabled = false;
    }
  });
})();

/* ============================================================
   OPTIONAL: minimal backend for RAG_CONFIG.mode = "remote"
   (Node/Express + Anthropic SDK — copy into your own server)

   npm install express @anthropic-ai/sdk cors

   import express from "express";
   import cors from "cors";
   import Anthropic from "@anthropic-ai/sdk";

   const app = express();
   app.use(cors());
   app.use(express.json());
   const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

   app.post("/api/chat", async (req, res) => {
     const { question, contextChunks } = req.body;
     const context = contextChunks.map(c => `[${c.category}] ${c.text}`).join("\n");

     const msg = await anthropic.messages.create({
       model: "claude-sonnet-4-6",
       max_tokens: 400,
       system: "You are a portfolio assistant for Md. Tasneemul Hassan. Answer only from the provided context, in 2-4 sentences, in third person.",
       messages: [{ role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }]
     });

     res.json({
       answer: msg.content[0].text,
       sources: contextChunks.map(c => c.category)
     });
   });

   app.listen(3000);

   Then in rag.js set:
     RAG_CONFIG.mode = "remote";
     RAG_CONFIG.apiEndpoint = "http://localhost:3000/api/chat";
============================================================ */
