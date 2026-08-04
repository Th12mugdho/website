# Deploying the generative RAG backend

This upgrades your portfolio chatbot from **extractive** (returns a
`knowledge.js` chunk verbatim) to **generative** (Claude actually writes
the answer, using that chunk as grounded context). The retrieval logic
in `rag.js` doesn't change at all — only where the final answer comes from.

## 1. Test it locally first

```
cd backend-scaffold
npm install
cp .env.example .env
```

Open `.env` and paste in a real Anthropic API key from
https://console.anthropic.com/settings/keys

```
npm start
```

You should see `RAG backend listening on http://localhost:3000`.

## 2. Point your site at it (while testing locally)

In `rag.js`, temporarily set:

```js
const RAG_CONFIG = {
  mode: "remote",
  apiEndpoint: "http://localhost:3000/api/chat",
  topK: 2,
  minScore: 0.5
};
```

Open your site (e.g. via a local static server on port 5500, matching
the default `ALLOWED_ORIGINS` in `.env.example`) and try the chat —
answers should now be generated, not just extracted.

## 3. Deploy for real

Any Node hosting works. Two easy free-tier options:

**Render** (recommended, simplest for a small Express app)
1. Push the `backend-scaffold` folder to a GitHub repo.
2. On render.com: New → Web Service → connect the repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Add environment variables `ANTHROPIC_API_KEY` and `ALLOWED_ORIGINS`
   (set `ALLOWED_ORIGINS` to your real site URL, e.g. `https://www.bueec.com`).
5. Deploy — Render gives you a URL like `https://your-app.onrender.com`.

**Railway** — same idea, similar steps, railway.app.

## 4. Point your live site at the deployed backend

In `rag.js`:

```js
const RAG_CONFIG = {
  mode: "remote",
  apiEndpoint: "https://your-app.onrender.com/api/chat",
  topK: 2,
  minScore: 0.5
};
```

Re-upload `rag.js` to your site.

## Notes

- **Never** put your `ANTHROPIC_API_KEY` in any file that ships to the
  browser (not in `rag.js`, not in `index.html`). It only ever belongs
  in the backend's environment variables. `server.js` is already written
  this way — keep it that way if you modify it.
- `server.js` includes a small per-IP rate limiter (15 requests/minute)
  so a bot or curious visitor can't run up your API bill. For real
  production traffic you'd want something more robust, but this is a
  reasonable baseline for a personal portfolio.
- If `mode: "remote"` and the backend is unreachable, `rag.js` will show
  a "hit a snag" message rather than breaking the whole chat — you can
  always flip `RAG_CONFIG.mode` back to `"local"` as an instant fallback.
