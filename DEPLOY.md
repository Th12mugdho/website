# Deploying the site with the ASK.TH AI assistant

`server.js` does two jobs: it serves the website and runs the AI chat
endpoint (`/api/chat`, powered by Claude). Deploying it as **one web
service** is the simplest setup. The site and the API share one address,
so nothing in the page's security settings needs changing.

If the backend isn't running (for example the site is opened from plain
static hosting), the chat automatically switches to **offline mode**. It
then answers from `knowledge.js` with keyword search, so it never breaks.

## 1. Run it on your computer

You need Node.js 20 or newer (https://nodejs.org).

```
npm install
copy env.example .env        (Windows)   |   cp env.example .env   (Mac/Linux)
```

Open `.env` and paste your Anthropic API key
(https://console.anthropic.com/settings/keys). Then run:

```
npm start
```

Open http://localhost:3000. The chat header should say **AI · CLAUDE**.
Try "What is Payra?" and then a follow-up like "What was hard about it?".
The assistant remembers the conversation.

## 2. Deploy (Render, free tier)

1. Put this folder in a GitHub repository. `.gitignore` already keeps
   `.env` and `node_modules/` out of it, so your key is never uploaded.
2. On https://render.com: **New → Web Service** → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Under **Environment**, add `ANTHROPIC_API_KEY` (your key) and
   `TRUST_PROXY=1`. Optionally set `DAILY_LIMIT` and `PER_MINUTE_LIMIT`.
5. Deploy. Render gives you a URL like `https://your-app.onrender.com`.
   Open it and test the chat.
6. Point your domain (e.g. www.bueec.com) at the Render service in
   Render's **Custom Domains** settings.

Railway, Fly.io or any VPS work the same way: `npm install`, then
`npm start`, with the same environment variables.

> Render's free tier sleeps after inactivity, so the first chat message
> after a quiet period can take ~30–60 s while it wakes up. A paid
> instance avoids this.

## 3. If you keep the site on separate static hosting

This only applies if you host the HTML somewhere else and deploy only
the API:

- Set `apiEndpoint` in `rag.js` to `https://your-app.onrender.com/api/chat`.
- Add that origin to `connect-src` in the Content-Security-Policy
  `<meta>` tag of `index.html`. Otherwise the browser blocks the request
  and the chat stays in offline mode.
- Set `ALLOWED_ORIGINS` on the backend to your site's address.

## Costs and safety

- **Model:** Claude Opus 5.5 at low effort by default. To use another
  model, set `CLAUDE_MODEL` (e.g. `claude-haiku-5-5` costs much less).
  Answers are capped at 4,096 output tokens.
- **Limits:** each visitor gets 12 messages per minute and the whole site
  300 per day by default. When a limit is hit, the visitor sees a short
  note and an offline answer instead.
- **Refusal fallback:** with Opus 5.5 the backend turns on Anthropic's
  server-side refusal fallback. If a harmless question is wrongly
  declined, another model answers it in the same request.
- **Your key** only ever lives in `.env` or the host's environment
  variables, never in a file the browser downloads. The server serves
  only the site's public files: `server.js`, `.env` and `package.json`
  return 404.
- **Spend cap:** set a monthly limit in the Anthropic Console
  (Settings → Limits) as a final safety net.

## Updating what the assistant knows

Edit `knowledge.js`. The server reads it at startup (restart or redeploy
after editing), and the offline mode uses the same file. Every fact the
AI states about you comes from there, so keep it accurate.
