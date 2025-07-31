# Quick Email Setup Guide

## 🚀 Fast Setup (SendGrid - Recommended)

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Create free account (100 emails/day free)
3. Verify your email address

### Step 2: Get API Key
1. Go to SendGrid Dashboard → Settings → API Keys
2. Create new API Key with "Full Access" or "Restricted Access" (Mail Send)
3. Copy the API key

### Step 3: Set Environment Variables
1. Go to Supabase Dashboard → Settings → Environment Variables
2. Add these variables:
   ```
   SENDGRID_API_KEY=your_api_key_here
   FROM_EMAIL=your_verified_email@domain.com
   ```

### Step 4: Create Edge Function
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`
4. Create function: `supabase functions new send-email`
5. Replace function code with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body, type = 'transaction' } = await req.json()
    
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL')
    
    if (!SENDGRID_API_KEY || !FROM_EMAIL) {
      throw new Error('Missing environment variables')
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL },
        subject: subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    })

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 5: Deploy Function
```bash
supabase functions deploy send-email
```

### Step 6: Test Email
1. Go to Supabase Dashboard → Edge Functions
2. Find `send-email` function
3. Click "Invoke" with test data:
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "body": "This is a test email from TallyKhata"
}
```

## 🔧 Alternative: Resend

### Step 1: Create Resend Account
1. Go to [Resend.com](https://resend.com)
2. Create account (3,000 emails/month free)
3. Verify your domain

### Step 2: Get API Key
1. Go to Resend Dashboard → API Keys
2. Create new API Key
3. Copy the key

### Step 3: Update Edge Function
Replace SendGrid code with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body } = await req.json()
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL')
    
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      throw new Error('Missing environment variables')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        text: body,
      }),
    })

    if (!response.ok) {
      throw new Error(`Resend error: ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## 📧 Environment Variables

Add these to Supabase Dashboard → Settings → Environment Variables:

### For SendGrid:
```
SENDGRID_API_KEY=sg.your_api_key_here
FROM_EMAIL=your_verified_email@domain.com
```

### For Resend:
```
RESEND_API_KEY=re.your_api_key_here
FROM_EMAIL=your_verified_email@domain.com
```

## 🧪 Testing

### Test Transaction Email
```javascript
// Run in browser console
fetch('https://your-project.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_anon_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Transaction',
    body: 'This is a test transaction email'
  })
})
.then(r => r.json())
.then(console.log)
```

## ✅ Success Checklist

- [ ] SendGrid/Resend account created
- [ ] API key obtained
- [ ] Environment variables set
- [ ] Edge function deployed
- [ ] Test email sent successfully
- [ ] Transaction emails working
- [ ] Debt reminder emails working

## 🆘 Troubleshooting

### "Missing environment variables"
- Check Supabase Dashboard → Settings → Environment Variables
- Ensure variable names match exactly

### "API key invalid"
- Verify API key is correct
- Check if key has proper permissions

### "Email not sending"
- Check Edge Function logs in Supabase Dashboard
- Verify recipient email is valid
- Check spam folder

### "CORS error"
- Ensure function has proper CORS headers
- Check if function URL is correct 