# JobCraft AI Deployment Guide

## Prerequisites

1. **Supabase Project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Get your service role key (keep this secret!)

2. **Stripe Account** (Optional - for payments)
   - Create products for Pro and Premium tiers
   - Get your secret key and publishable key
   - Set up webhook endpoint after deployment

3. **Google AI API Key** (for Gemini)
   - Get API key from [Google AI Studio](https://aistudio.google.com)

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
\`\`\`

### Optional Variables (for full functionality)
\`\`\`
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
ADMIN_EMAIL=your-admin-email@example.com
\`\`\`

## Deployment Steps

1. **Deploy to Vercel**
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables
   - Deploy

2. **Initialize Database**
   After deployment, visit these URLs to create tables:
   \`\`\`
   https://your-app.vercel.app/api/admin/create-user-profiles-table
   https://your-app.vercel.app/api/admin/create-waitlist-table
   https://your-app.vercel.app/api/admin/create-roles-tables
   https://your-app.vercel.app/api/admin/create-permissions-tables
   \`\`\`

3. **Create Master Admin**
   Visit: `https://your-app.vercel.app/admin/create-master-admin`

4. **Configure Stripe Webhooks** (if using Stripe)
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events: `customer.subscription.*`, `invoice.*`
   - Copy webhook secret to environment variables

5. **Test Deployment**
   Visit: `https://your-app.vercel.app/api/health`

## Post-Deployment

- Test the landing page and waitlist signup
- Test admin login at `/admin/login`
- Verify all integrations are working
- Set up monitoring and error tracking

## Troubleshooting

- Check Vercel function logs for errors
- Verify all environment variables are set
- Ensure Supabase RLS policies are configured
- Check Stripe webhook delivery if payments aren't working
