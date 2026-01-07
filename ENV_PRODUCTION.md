# Required Environment Variables for MoneyLoop Production

# These environment variables must be configured in your Netlify dashboard
# for production deployment. Navigate to: Site Settings > Build & Deploy > Environment Variables

## Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

## Plaid API (Banking)
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=production  # Use 'sandbox' for testing
NEXT_PUBLIC_PLAID_ENV=production

## Anthropic Claude API (AI Agent)
ANTHROPIC_API_KEY=your-anthropic-api-key

## Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

## Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

## Application URLs
NEXT_PUBLIC_SITE_URL=https://moneyloop.app
NEXTAUTH_URL=https://moneyloop.app
NEXTAUTH_SECRET=generate-a-32-char-secret

## Optional: Analytics & Monitoring
# SENTRY_DSN=your-sentry-dsn
# MIXPANEL_TOKEN=your-mixpanel-token

---

# Checklist for Production Deployment:

1. [ ] Configure all environment variables in Netlify
2. [ ] Run Supabase migrations in production database
3. [ ] Set Plaid to 'production' environment (requires approval)
4. [ ] Add your domain to Google Cloud Console authorized origins
5. [ ] Configure Stripe webhooks for your production domain
6. [ ] Set up Anthropic API with production billing
7. [ ] Enable SSL/HTTPS on custom domain
