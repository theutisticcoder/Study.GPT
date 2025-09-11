# StudyFlow (Vercel Ready)

A modern study app with free AI support (Google Gemini) + AP practice plans.

## 🚀 Deployment on Vercel

1. Push this project to GitHub.
2. Import repo into [Vercel](https://vercel.com).
3. In project settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable in Vercel dashboard:
   - `GEMINI_API_KEY=your_google_gemini_key`
5. Deploy 🎉

Frontend at `/`, Gemini API available at `/api/gemini`.

