# Environment Setup Guide for AI Khata

## Required Environment Variables

### 1. Supabase Configuration

Get these from your Supabase project dashboard:

#### NEXT_PUBLIC_SUPABASE_URL
- Location: Settings > API > Project URL
- This is your Supabase project URL
- Example: `https://your-project.supabase.co`

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- Location: Settings > API > anon public
- This is used for client-side Supabase access
- Note: This is safe to expose publicly

#### SUPABASE_SERVICE_ROLE_KEY (⚠️ IMPORTANT - SERVER ONLY)
- Location: Settings > API > service_role (Secret key)
- This key MUST be in `.env.local` and NEVER exposed to the client
- It's used by the Next.js API routes to bypass Row-Level Security policies
- This is what fixes the "row violates row-level security policy" error

### 2. Google Gemini API

- Get from: https://aistudio.google.com/app/apikeys
- Set as `NEXT_PUBLIC_GOOGLE_API_KEY`

## Setup Steps

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get Supabase credentials:**
   - Go to https://supabase.com and login
   - Open your project
   - Go to Settings > API
   - Copy the Project URL and keys

3. **Fill in .env.local with all three Supabase keys:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Why Server-Side API Routes?

The app now uses Next.js API routes (`/app/api/transactions/`) that run on the server:

- **Client-side** (browser) uses `NEXT_PUBLIC_*` keys (anonymous access)
- **Server-side** (API routes) uses `SUPABASE_SERVICE_ROLE_KEY` (full access)

This approach:
- ✅ Bypasses RLS policies safely
- ✅ Keeps sensitive keys secure
- ✅ Provides better error handling
- ✅ Is production-ready
- ✅ Follows Supabase security best practices

## Troubleshooting

### "row violates row-level security policy"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
- Verify the key is correct in Supabase dashboard
- Restart the dev server

### "Missing Supabase server env vars"
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart dev server after adding variables

### "Failed to add transaction"
- Check browser console for detailed error message
- Verify all environment variables are set
- Check Supabase service status: https://status.supabase.com

## Production Deployment

When deploying to Vercel, Netlify, or other platforms:

1. Add environment variables in the platform's settings
2. **NEVER** commit `.env.local` to git
3. Keep `SUPABASE_SERVICE_ROLE_KEY` private (only in server env)
4. Ensure public keys are marked as `NEXT_PUBLIC_*`

Example for Vercel:
- Go to Project Settings > Environment Variables
- Add all variables from `.env.local`
- Restart deployment
