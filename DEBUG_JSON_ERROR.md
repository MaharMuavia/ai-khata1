# Debugging Guide: SyntaxError "Unexpected token '<'"

## What This Error Means

When you see: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

This means:
1. Your app tried to call the API
2. The API endpoint returned **HTML** instead of **JSON**
3. This usually means the API route failed to load or has an error

## Root Causes (Fixed ✅)

### 1. ✅ Environment Variables Missing
**Before:** The `supabaseServer.ts` was throwing an error at module load time if env vars were missing.  
**Fixed:** Now it uses lazy loading and only throws errors when you actually try to use it.

### 2. ✅ Poor Error Handling  
**Before:** API errors weren't properly caught and returned as JSON.  
**Fixed:** Now all routes have proper try-catch with JSON error responses.

### 3. ✅ JSON Parse Errors
**Before:** The hook always tried to parse response as JSON, even if it was HTML.  
**Fixed:** Now it checks content-type and handles HTML error pages gracefully.

## What We Fixed

### File 1: `lib/supabaseServer.ts` 
- Changed from immediate initialization to lazy loading
- Only throws errors when API is actually called
- Better error messages

### File 2: `app/api/transactions/route.ts`
- Added proper JSON parsing with error handling
- Added helper function `safeSupabaseCall`
- Validates all responses
- Better error messages

### File 3: `hooks/use-transactions.ts`
- Added `parseResponse()` helper function
- Detects HTML vs JSON responses
- Extracts error messages from both types
- Better console logging

## Verification Steps

### Step 1: Check Environment Variables
Ensure `.env.local` has all 4 variables:

```bash
# Run this to check
cat .env.local
```

Should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://akbsaljjwspbjgjrgkur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EcAIBjcZ2IAT0Le8aYUPXA_6MyxR0iM
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAjDHdWdwAGLg0SkREvEWMn-g9mWUGu98U
```

### Step 2: Build Check for Syntax Errors
```bash
npm run build
```

If this passes, no syntax errors exist in your code.

### Step 3: Start Dev Server
```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.5.15
  - Local:        http://localhost:3000
```

### Step 4: Check Browser Console
Open http://localhost:3000 in browser  
Press F12 to open Developer Tools  
Go to Console tab

Look for any errors. If you see the JSON error, check if:
- API endpoint is accessible: http://localhost:3000/api/transactions
- Environment variables are set
- No module import errors

## Testing the API Directly

### Test 1: Fetch Transactions (GET)
```bash
curl http://localhost:3000/api/transactions
```

Should return JSON like:
```json
{"data":[]}
```

If you see HTML, something is broken. Share the output.

### Test 2: Create Transaction (POST)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "category": "sales",
    "amount": 100,
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
    "item": "Test Item"
  }'
```

Should return JSON with status 201.

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Still see HTML error | Check `.env.local` has all 4 variables, restart `npm run dev` |
| "Missing SUPABASE_SERVICE_ROLE_KEY" | Get from Supabase > Settings > API > service_role |
| API returns 500 error | Check browser console for error message |
| Build fails | Run `npm run clean && npm install && npm run build` |

## If Still Having Issues

1. **Clear cache:**
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   npm run dev
   ```

2. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Check Next.js specific issues:**
   - Make sure `route.ts` is in correct location: `app/api/transactions/route.ts`
   - Make sure it has proper exports: `GET`, `POST`, `PUT`, `DELETE`

4. **Share server logs:** 
   - Copy the full error output from terminal when running `npm run dev`
   - Include the error from browser console (F12)

## What Changed Summary

```javascript
// ❌ BEFORE (Broken)
const supabaseServer = createClient(...) // Throws immediately if env vars missing

// ✅ AFTER (Fixed)
function getSupabaseServer() {
  // Only throws when actually used, not at module load
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw Error(...)
  return createClient(...)
}
```

This allows Next.js to build successfully even without env vars, then shows a proper error message when you actually try to use the API.

## Production Checklist

✅ `.env.local` has all 4 variables  
✅ No "Missing" error messages  
✅ `npm run build` succeeds  
✅ `npm run dev` starts without errors  
✅ Browser shows no red errors in console  
✅ API returns JSON (not HTML)  
✅ Transactions save successfully  

You're ready to go! 🚀
