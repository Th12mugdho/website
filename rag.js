/* ============================================================
   rag.js — the ASK.TH chat assistant (browser side).

   mode "auto" (default): talks to the AI backend (server.js →
   Claude) and streams the answer in word by word, remembering
   the conversation. If the backend isn't reachable — e.g. the
   site is opened from plain static hosting — it quietly falls
   back to OFFLINE mode: keyword retrieval over knowledge.js,
   answering with the best-matching facts.

   mode "local":  offline retrieval only (no network).
   mode "remote": AI only (shows an error if the backend is down).
============================================================ */

const RAG_CONFIG = {
  mode: "auto",               // "auto" | "remote" | "local"
  apiEndpoint: "/api/chat",   // same origin as the site when served by server.js
  historyTurns: 6,            // visitor+assistant exchanges sent for context
  firstByteTimeoutMs: 25000,
  topK: 2,                    // offline retrieval
  minScore: 0.5
};

(function(){
  // ---------------- Offline retrieval (fallback) ----------------
  const STOPWORDS = new Set(["a","an","the","is","are","was","were","do","does","did","what","who","where","when","how","why","in","on","of","for","to","and","or","your","you","his","her","he","she","it","tell","me","about","can","i","my","please","have","has"]);
  function tokenize(str){
    return (str.toLowerCase().match(/[a-z0-9+#]+/g) || []).filter(w => !STOPWORDS.has(w) && w.length > 1);
  }
  function retrieve(question, topK){
    const qTokens = tokenize(question);
    if (!qTokens.length || !window.KNOWLEDGE_BASE) return [];
    return window.KNOWLEDGE_BASE.map(chunk => {
      let score = 0;
      const bodyTokens = tokenize(chunk.text);
      qTokens.forEach(qt => {
        if (chunk.keywords.some(k => k.toLowerCase().includes(qt) || qt.includes(k.toLowerCase()))) score += 2;
        if (bodyTokens.includes(qt)) score += 1;
      });
      return { chunk, score };
    })
    .filter(s => s.score >= RAG_CONFIG.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
  }
  function answerLocal(question){
    const chunks = retrieve(question, RAG_CONFIG.topK);
    if (!chunks.length){
      return {
        text: "I don't have anything on that yet. Try asking about Payra, MechaHex, his publications, leadership roles, or how to get in touch, or email him at tasneemulhassan12@gmail.com.",
        sources: []
      };
    }
    return { text: chunks.map(c => c.text).join(" "), sources: chunks.map(c => c.category) };
  }

  // ---------------- Safe mini-markdown → DOM ----------------
  // The model's text is escaped first; only **bold**, `code`, [links](url) and "- " bullets
  // are turned back into markup, and links must point somewhere we trust.
  function escapeHTML(s){
    return s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function safeHref(url){
    if (/^(https?:\/\/|mailto:)/i.test(url)) return { href: url, external: /^https?:/i.test(url) };
    if (/^#[\w-]+$/.test(url) || /^(payra|index)\.html(#[\w-]+)?$/.test(url)) return { href: url, external: false };
    return null;
  }
  function inline(s){
    let h = escapeHTML(s);
    h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
    h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const raw = url.replace(/&amp;/g, "&");
      const ok = safeHref(raw);
      if (!ok) return label;
      const attrs = ok.external ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${escapeHTML(raw)}"${attrs}>${label}</a>`;
    });
    return h;
  }
  function renderMarkdown(text){
    const out = [];
    let list = null;
    text.split(/\n/).forEach(line => {
      const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
      if (bullet){
        if (!list){ list = []; }
        list.push(`<li>${inline(bullet[1])}</li>`);
        return;
      }
      if (list){ out.push(`<ul>${list.join("")}</ul>`); list = null; }
      if (line.trim()) out.push(`<p>${inline(line.trim())}</p>`);
    });
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("");
  }

  // ---------------- UI wiring ----------------
  const body = document.getElementById("chatBody");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  const resetBtn = document.getElementById("chatReset");
  const modeTag = document.getElementById("chatMode");
  if (!form) return;

  const history = [];                 // [{role, content}] — what the AI sees
  let remoteDown = RAG_CONFIG.mode === "local";
  let busy = false;

  function setModeTag(){
    if (!modeTag) return;
    modeTag.textContent = remoteDown ? "offline mode" : "AI · Claude";
    modeTag.classList.toggle("is-offline", remoteDown);
  }
  setModeTag();

  function scrollDown(){ body.scrollTop = body.scrollHeight; }

  function addBubble(role){
    const el = document.createElement("div");
    el.className = "chat-msg" + (role === "user" ? " user" : " bot");
    body.appendChild(el);
    scrollDown();
    return el;
  }
  function addTyping(){
    const el = document.createElement("div");
    el.className = "chat-msg chat-typing-wrap";
    el.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    body.appendChild(el);
    scrollDown();
    return el;
  }
  function addSources(el, sources){
    if (!sources || !sources.length) return;
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

  // Stream from the backend. Resolves with the full text; throws {offline:true} if the
  // backend can't be used at all (so we can fall back), or a normal Error mid-answer.
  async function streamRemote(messages, onText){
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), RAG_CONFIG.firstByteTimeoutMs);
    let res;
    try {
      res = await fetch(RAG_CONFIG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: ctrl.signal
      });
    } catch (e) {
      clearTimeout(timer);
      throw Object.assign(new Error("Backend unreachable"), { offline: true });
    }
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || !ctype.includes("text/event-stream")){
      clearTimeout(timer);
      let info = null;
      try { info = await res.json(); } catch(e){ /* not JSON (e.g. static host 404/501) */ }
      // 429 = our own limits: tell the visitor, but keep using offline answers for now
      throw Object.assign(new Error((info && info.message) || ("Backend " + res.status)), {
        offline: true, notice: res.status === 429 && info ? info.message : null
      });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "", full = "", first = true;
    for (;;){
      let chunk;
      try { chunk = await reader.read(); }
      catch (e){
        clearTimeout(timer);
        throw Object.assign(new Error("The assistant took too long to respond. Please try again."), { offline: !full });
      }
      const { value, done } = chunk;
      if (first){ clearTimeout(timer); first = false; }
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1){
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = frame.split("\n").find(l => l.startsWith("data: "));
        if (!line) continue;
        let evt;
        try { evt = JSON.parse(line.slice(6)); } catch(e){ continue; }
        if (evt.type === "text"){ full += evt.text; onText(full); }
        else if (evt.type === "error"){
          throw Object.assign(new Error(evt.message || "AI error"), { offline: !evt.partial && !full });
        }
      }
    }
    return full;
  }

  async function ask(question){
    if (!question || busy) return;
    busy = true; sendBtn.disabled = true;
    const userEl = addBubble("user");
    userEl.textContent = question;
    history.push({ role: "user", content: question });

    const typing = addTyping();
    let botEl = null;
    let rafQueued = false, latest = "";
    const paint = () => { rafQueued = false; if (botEl){ botEl.innerHTML = renderMarkdown(latest); scrollDown(); } };

    try {
      if (remoteDown) throw Object.assign(new Error("offline"), { offline: true });
      const answer = await streamRemote(history.slice(-RAG_CONFIG.historyTurns * 2), (text) => {
        if (!botEl){ typing.remove(); botEl = addBubble("bot"); }
        latest = text;
        if (!rafQueued){ rafQueued = true; requestAnimationFrame(paint); }   // batch DOM updates per frame
      });
      if (!botEl){ typing.remove(); botEl = addBubble("bot"); }
      latest = answer || "Sorry, I didn't get an answer back. Please try again.";
      paint();
      history.push({ role: "assistant", content: latest });
    } catch (err){
      typing.remove();
      if (err.offline && RAG_CONFIG.mode !== "remote" && !botEl){
        if (!err.notice) remoteDown = true;           // backend missing: stay offline this session
        setModeTag();
        const local = answerLocal(question);
        botEl = addBubble("bot");
        if (err.notice){
          const note = document.createElement("p");
          note.className = "chat-notice";
          note.textContent = err.notice + " Here's what I have offline:";
          botEl.appendChild(note);
        }
        const p = document.createElement("p");
        p.textContent = local.text;
        botEl.appendChild(p);
        addSources(botEl, local.sources);
        history.push({ role: "assistant", content: local.text });
      } else {
        if (!botEl) botEl = addBubble("bot");
        const p = document.createElement("p");
        p.className = "chat-notice";
        p.textContent = err.message || "Something went wrong. Please try again.";
        botEl.appendChild(p);
        history.pop();                                 // drop the unanswered question from context
        console.error("[rag.js]", err);
      }
    } finally {
      busy = false; sendBtn.disabled = false;
      scrollDown();
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    ask(q.slice(0, 800));
  });

  document.querySelectorAll(".chat-chip[data-question]").forEach(chip => {
    chip.addEventListener("click", () => {
      const suggestions = chip.closest(".chat-suggestions");
      if (suggestions) suggestions.remove();
      ask(chip.dataset.question);
    });
  });

  if (resetBtn){
    resetBtn.addEventListener("click", () => {
      if (busy) return;
      history.length = 0;
      [...body.children].slice(1).forEach(el => el.remove());   // keep the greeting
      input.focus();
    });
  }
})();
