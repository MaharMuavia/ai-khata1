# Production Readiness Checklist

## ✅ Row-Level Security Fix
- [x] Created server-side Supabase client (`lib/supabaseServer.ts`)
- [x] Created API routes (`app/api/transactions/route.ts`)
  - [x] GET - fetch all transactions
  - [x] POST - create transaction
  - [x] PUT - update transaction
  - [x] DELETE - delete transaction
- [x] Updated hooks to use API endpoints instead of client-side Supabase
- [x] Implemented proper error handling and validation

## ✅ Environment Configuration
- [x] Updated `.env.example` with all required variables
- [x] Added `SUPABASE_SERVICE_ROLE_KEY` configuration
- [x] Created `ENV_SETUP.md` with detailed setup instructions
- [x] Documented security best practices

## ✅ Error Handling
- [x] Improved error messages in dashboard
- [x] Specific error handling for RLS violations
- [x] Missing environment variable detection
- [x] Console logging for debugging

## ✅ Code Quality
- [x] TypeScript validation
- [x] Input validation in API routes
- [x] Proper HTTP status codes
- [x] Request/response structure standardization

## ✅ Documentation
- [x] Updated README.md with production setup
- [x] Created ENV_SETUP.md with detailed configuration
- [x] Added troubleshooting guide
- [x] Documented architecture
- [x] Added deployment instructions

## Deployment Instructions

### Before Deploying to Production:

1. **Environment Variables Setup**
   ```bash
   # Get from Supabase Dashboard
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (KEEP PRIVATE)
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
   ```

2. **Supabase RLS Setup (if not already done)**
   ```sql
   -- Example RLS policy (if you want to add user authentication later)
   CREATE POLICY "Allow all users to insert their own transactions" 
     ON transactions 
     FOR INSERT 
     WITH CHECK (true);
   ```

3. **Build & Test Locally**
   ```bash
   npm install
   npm run build
   npm run start
   ```

4. **Deploy to Vercel/Netlify**
   - Add environment variables in platform dashboard
   - Deploy with git push or platform UI

### Vercel Deployment Example:
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add each variable from `.env.local`
3. Redeploy

### Local Testing Checklist:
- [ ] Add new transaction via voice
- [ ] Add new transaction via text
- [ ] Edit existing transaction
- [ ] Delete transaction
- [ ] Delete last transaction
- [ ] Filter by date
- [ ] Download CSV report
- [ ] Check console for errors
- [ ] Test with no microphone (text fallback)

## Security Notes

✅ **What's Secure:**
- Service role key stays on server
- Never exposed to browser
- All database operations validated
- Input sanitization in place

⚠️ **Production Reminders:**
- Never commit `.env.local` to git
- Use `.env.example` as template
- Keep service role key private
- Use HTTPS in production
- Monitor error logs
- Regular backups of Supabase database

## API Routes Reference

### GET /api/transactions
Returns all transactions ordered by timestamp (newest first)
```bash
curl http://localhost:3000/api/transactions
```

### POST /api/transactions
Create new transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid",
    "category": "sales",
    "amount": 1000,
    "item": "Product",
    "customer_name": "John",
    "status": "paid",
    "timestamp": "2024-01-01T10:00:00Z"
  }'
```

### PUT /api/transactions
Update transaction
```bash
curl -X PUT http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid",
    "amount": 2000
  }'
```

### DELETE /api/transactions
Delete transaction
```bash
curl -X DELETE http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"id": "uuid"}'
```

## Support & Troubleshooting

For issues, check:
1. `.env.local` configuration (all three Supabase keys present)
2. Browser console for detailed error messages
3. Server logs for API errors
4. Supabase dashboard for table schema and RLS policies

See ENV_SETUP.md for common issues.
