<div align="center">

<img width="1200" height="475" alt="AI Khata Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🧾 AI Khata

### Voice-Powered AI Ledger for Small Businesses

*Manage sales, expenses, and credit (udhaar) just by speaking — in Urdu, Hindi, or Roman Urdu.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

[Live Demo](https://ai.studio/apps/ab2476d0-4aa7-4f6a-b576-bd12ae7a5322) · [Quick Start](#-quick-start) · [Features](#-features) · [Architecture](#-architecture)

</div>

---

## 📖 Overview

**AI Khata** is an AI-powered voice ledger built for small local shopkeepers and businesses in Pakistan and South Asia. Instead of writing entries by hand, the shopkeeper simply *speaks* a command in natural mixed Urdu/English/Roman Urdu — for example, *"Aslam ko 800 ka udhaar diya"* — and the app uses Google Gemini AI to understand the intent, categorize it, and record the transaction automatically.

It replaces the traditional paper *khata* (ledger book) with a fast, secure, and intelligent digital alternative that anyone can use, even with limited literacy or typing ability.

## ✨ Features

- 🎙️ **Voice-First Input** — Record sales, expenses, and credit by speaking. Powered by browser speech recognition with Urdu/Hindi/Roman Urdu support.
- 🤖 **AI Command Parsing** — Google Gemini interprets natural-language commands and extracts structured transactions (amount, item, customer, category).
- 💬 **Conversational Assistant** — Replies in friendly Roman Urdu and asks for clarification when details (like the amount) are missing.
- 📒 **Smart Ledger** — Add, edit, delete, or "delete last entry" — all by voice or text. The AI finds the right entry from context (e.g. *"Aslam ka udhaar 800 kar do"*).
- 🗂️ **Three Categories** — Track **Sales**, **Expenses**, and **Udhaar** (credit) with paid/unpaid status.
- 📊 **Reports & Charts** — Visual summaries with interactive charts, filterable by today, yesterday, week, month, or all time.
- 📥 **CSV Export** — Download your records for accounting or backup.
- 🔒 **Production-Grade Security** — Sensitive keys stay server-side; Row-Level Security handled safely via API routes.
- ☁️ **Real-Time Sync** — Backed by Supabase for reliable, real-time cloud storage.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) · React 19 |
| **Language** | TypeScript 5 |
| **AI** | Google Gemini (`@google/genai`) |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Icons / Motion** | Lucide React · Motion |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+
- A free **[Supabase](https://supabase.com)** account
- A free **[Google Gemini API key](https://aistudio.google.com/app/apikeys)**

### 1. Clone & install

```bash
git clone https://github.com/MaharMuavia/ai-khata1.git
cd ai-khata1
npm install
```

### 2. Configure environment variables

Copy the template and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` ⚠️ | Supabase → Settings → API → `service_role` (keep secret) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikeys) |

> ⚠️ **Never commit `.env.local`** — the service role key grants full database access.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start adding entries by voice or text.

## 🧩 Architecture

```
ai-khata1/
├── app/
│   ├── api/transactions/route.ts   # Server-side API (uses service role key)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── main-dashboard.tsx          # UI, voice interface & charts
├── hooks/
│   └── use-transactions.ts         # API calls & state management
├── lib/
│   ├── supabaseClient.ts           # Client-side Supabase (public)
│   ├── supabaseServer.ts           # Server-side Supabase (service role)
│   ├── gemini.ts                   # AI transaction parsing
│   └── types.ts
└── public/
```

### How it works

```
🎤 Voice/Text  →  🤖 Gemini parses intent  →  🌐 /api/transactions
                                                      │
                                          🔐 Server (service role key)
                                                      │
                                              🗄️ Supabase (RLS-safe)
                                                      │
                                          📊 UI updates in real time
```

1. The browser captures voice or text and sends it to **Gemini** for parsing.
2. The structured result is sent to the **`/api/transactions`** API route.
3. The **server** uses the Supabase service role key to write data safely, bypassing RLS without exposing secrets.
4. The response updates the **ledger and charts** instantly.

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run clean    # Clear Next.js build cache
```

## ☁️ Deployment

Deploy to **Vercel**, **Netlify**, or any Node host:

1. Add all `.env.local` variables to your platform's environment settings.
2. Keep `SUPABASE_SERVICE_ROLE_KEY` **private** (server-only — do not prefix with `NEXT_PUBLIC_`).
3. Redeploy after adding variables.

## 🩺 Troubleshooting

| Error | Solution |
|-------|----------|
| `row violates row-level security policy` | Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` |
| `Missing Supabase server env vars` | Ensure all three Supabase keys are set |
| Microphone not working | Use Chrome/Edge/Safari, allow mic permission, or type instead |
| `Gemini API error` | Verify `NEXT_PUBLIC_GEMINI_API_KEY` is valid |

See [ENV_SETUP.md](ENV_SETUP.md) for a detailed environment setup guide.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request to improve features, fix bugs, or add language support.

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ to help local businesses go digital.

</div>
