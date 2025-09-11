StudyFlow — All-in-one deliverable
This archive contains:
- client/: Vite + React single-page app (client/src)
- server/: Express example server with /api/gemini endpoint stub
- README files with setup instructions

Quickstart (local, dev):
1. Install Node 18+.
2. In the project root run: npm install
   This will install workspace dependencies (client + server).
3. Start client: cd client && npm install && npm run dev
4. Start server: cd server && npm install && GEMINI_KEY=yourkey npm start
5. In production, host the client build (vite build) and run the server behind HTTPS.

Features implemented:
- AP practice plan builder + iCal export
- Client-side AI Tutor that calls /api/gemini
- Practice test runner with timer, extended-time accommodation, auto-scoring for MCQ
- Simple client-only "auth" using localStorage
- Accessibility accommodations toggles in client (contrast, dyslexic font placeholder, extended time)

If you want, I can:
- Add user accounts with real authentication (JWT + refresh tokens)
- Wire a production-ready Gemini integration (with code matching current Gemini API)
- Convert the client to TypeScript and add unit tests
- Deploy to Vercel/Render/Heroku with CI

