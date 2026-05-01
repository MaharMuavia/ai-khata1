<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Khata - Production Ready Ledger App

A voice-enabled AI-powered ledger application for managing sales, expenses, and credit transactions.

View your app in AI Studio: https://ai.studio/apps/ab2476d0-4aa7-4f6a-b576-bd12ae7a5322

## Prerequisites
- Node.js 16+
- Supabase account (free tier available at https://supabase.com)
- Google Gemini API key (free at https://aistudio.google.com/app/apikeys)

## Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables

**Copy the template:**
```bash
cp .env.example .env.local
```

**Get your Supabase credentials:**
1. Go to https://supabase.com and login
2. Open your project
3. Go to **Settings > API**
4. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` - service_role (Secret key) ⚠️

**Add Gemini API key:**
1. Go to https://aistudio.google.com/app/apikeys
2. Create an API key
3. Add to `.env.local` as `NEXT_PUBLIC_GEMINI_API_KEY`

### 3. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Key Production Features

### ✅ Row-Level Security Fixed
- Uses server-side API routes with Supabase service role key
- Bypasses RLS policies securely
- No more "row violates row-level security policy" errors
- Keeps sensitive keys private on the server

### ✅ Error Handling
- Detailed error messages in Urdu/Hindi
- Comprehensive console logging for debugging
- Graceful fallbacks for missing configuration

### ✅ Voice Input
- Speech recognition (Chrome, Edge, Safari)
- Urdu/Hindi command support
- Automatic transaction parsing with Gemini AI

### ✅ Data Management
- Add, edit, delete transactions
- Filter by date ranges
- Download reports as CSV
- Real-time synchronization with Supabase

## Architecture

```
.
├── app/
│   ├── api/transactions/route.ts    # Server-side API (uses service role key)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── main-dashboard.tsx            # UI & voice interface
├── hooks/
│   └── use-transactions.ts           # API calls & state management
├── lib/
│   ├── supabaseClient.ts             # Client-side Supabase (public access)
│   ├── supabaseServer.ts             # Server-side Supabase (service role key)
│   ├── gemini.ts                     # AI transaction parsing
│   └── types.ts
└── .env.local                        # Environment variables (gitignored)
```

## How It Works

1. **Frontend** (browser) sends requests to `/api/transactions`
2. **API Route** (server) receives request with service role key
3. **Server** bypasses RLS safely and updates Supabase
4. **Response** returned to frontend and UI updates

This ensures:
- ✅ No RLS violations
- ✅ Sensitive keys stay private
- ✅ Production-ready security

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint check
npm run lint

# Clean build cache
npm run clean
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "row violates row-level security policy" | Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` |
| "Missing Supabase server env vars" | Check `.env.local` has all three Supabase keys |
| "Mic not working" | Use Chrome/Edge, allow microphone permission, or use text input |
| "Gemini API error" | Verify API key in `.env.local` |

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment setup guide.

## Production Deployment

For Vercel, Netlify, or similar:

1. Add all `.env.local` variables to platform environment settings
2. **Keep `SUPABASE_SERVICE_ROLE_KEY` private** (server-only)
3. Ensure `NEXT_PUBLIC_*` variables are marked as public
4. Restart deployment after adding variables

Never commit `.env.local` to git!
