# JobCraft AI - Deployment Guide

## Prerequisites
- Vercel account
- Supabase project set up
- Stripe account configured
- Google AI API key

## Environment Variables Required

### Supabase Configuration
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
\`\`\`

### Database Configuration (Supabase provides these)
\`\`\`
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
\`\`\`

### Stripe Configuration
\`\`\`
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...
\`\`\`

### AI Configuration
\`\`\`
GOOGLE_AI_API_KEY=your_google_ai_api_key
\`\`\`

### Application Configuration
\`\`\`
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
ADMIN_EMAIL=your-admin-email@domain.com
\`\`\`

## Deployment Steps

### 1. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy the application

### 2. Database Setup
After deployment, run these API endpoints to set up your database:

1. **Create Master Admin**: `POST /api/admin/create-master-admin`
2. **Create Tables**: Run the migration endpoints in order:
   - `POST /api/admin/create-user-profiles-table`
   - `POST /api/admin/create-roles-tables`
   - `POST /api/admin/create-permissions-tables`
   - `POST /api/admin/create-testimonials-table`
   - `POST /api/admin/create-blogs-table`
   - `POST /api/admin/create-calendar-tokens-table`
   - `POST /api/admin/create-job-events-table`
   - `POST /api/admin/create-waitlist-table`
   - `POST /api/admin/add-user-deletion-fields`
   - `POST /api/admin/create-prompts-table`

### 3. Stripe Webhook Configuration
1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Admin Panel Access
1. Visit `/admin/setup` to complete admin setup
2. Use the admin email you configured to access admin features

## Post-Deployment Verification

### Test These Features:
- [ ] Landing page loads correctly
- [ ] Signup/waitlist functionality works
- [ ] Demo tabs function properly
- [ ] Audio files play correctly
- [ ] Admin panel is accessible
- [ ] Database connections work
- [ ] Stripe integration (if configured)

## Troubleshooting

### Common Issues:
1. **Build Errors**: Check TypeScript and ESLint settings in `next.config.mjs`
2. **Database Connection**: Verify Supabase environment variables
3. **Audio Files**: Ensure audio files are in `/public/audio/` directory
4. **Stripe Webhooks**: Verify webhook URL and secret

### Debug Endpoints:
- `/api/debug/session` - Check authentication
- `/api/debug/direct-query` - Test database connection
- `/admin/testing` - Admin panel diagnostics
\`\`\`

Now let's create a simple deployment verification script:
