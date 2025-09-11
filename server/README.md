# StudyFlow Server (Express) — Gemini integration example

This example server exposes POST /api/gemini which accepts JSON: { prompt, student, accommodations }.
It is intentionally minimal and should be adapted to your production needs.

Important notes:
- **Do not** put API keys in client code. Keep GEMINI_KEY in environment variables or a secrets manager.
- Use Google's official Gemini client library or recommended REST endpoint; the 'apiUrl' in index.js is a placeholder.
- Protect the endpoint: rate-limit, require authentication, and log minimally.

Run:
  cd server
  npm install
  export GEMINI_KEY="your_key_here"
  node index.js
