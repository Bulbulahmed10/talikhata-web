# Email Notification Setup Guide

## Option 1: Supabase Edge Functions (Recommended)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 4: Create Edge Function
```bash
supabase functions new send-transaction-email
```

### Step 5: Add the following code to `supabase/functions/send-transaction-email/index.ts`:

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
    const { customer, transaction, storeName } = await req.json()

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="bn">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>তালিখাতা - লেনদেনের বিজ্ঞপ্তি</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .amount { font-size: 24px; font-weight: bold; color: #4CAF50; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>তালিখাতা</h1>
                  <p>আপনার লেনদেনের বিজ্ঞপ্তি</p>
              </div>
              <div class="content">
                  <p>প্রিয় ${customer.name},</p>
                  <p>${transaction.type === 'given' ? 'আপনাকে' : 'আপনার কাছ থেকে'} ${transaction.amount} ৳ ${transaction.type === 'given' ? 'দেওয়া হয়েছে' : 'পাওয়া হয়েছে'}।</p>
                  <p class="amount">${transaction.amount} ৳</p>
                  <p><strong>তারিখ:</strong> ${new Date(transaction.date).toLocaleDateString('bn-BD')}</p>
                  <p><strong>বিবরণ:</strong> ${transaction.note || 'কোন বিবরণ নেই'}</p>
                  <p>ধন্যবাদ,<br>${storeName}</p>
              </div>
              <div class="footer">
                  <p>এই ইমেইল তালিখাতা থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।</p>
              </div>
          </div>
      </body>
      </html>
    `

    // Send email using your preferred service
    // Example with SendGrid:
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: customer.email }],
          subject: 'তালিখাতা - লেনদেনের বিজ্ঞপ্তি',
        }],
        from: { email: 'noreply@yourdomain.com', name: 'তালিখাতা' },
        content: [{
          type: 'text/html',
          value: emailHtml,
        }],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
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

### Step 6: Deploy the function
```bash
supabase functions deploy send-transaction-email
```

### Step 7: Set environment variables
```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
```

## Option 2: Using External Email Service

### SendGrid Setup:
1. Create a SendGrid account
2. Get your API key
3. Verify your sender domain
4. Use the code above in the Edge Function

### Resend Setup:
1. Create a Resend account
2. Get your API key
3. Verify your domain
4. Replace SendGrid code with Resend API

### Nodemailer Setup:
1. Install nodemailer: `npm install nodemailer`
2. Configure SMTP settings
3. Use nodemailer in your backend

## Option 3: Firebase Functions

If you prefer Firebase Functions:

1. Create a Firebase project
2. Install Firebase CLI
3. Create a function for sending emails
4. Deploy to Firebase Functions

## Testing Email Setup

Add this to your TransactionForm component:

```typescript
const sendTransactionEmail = async (customer: any, transaction: any) => {
  try {
    const response = await fetch('/functions/v1/send-transaction-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
      },
      body: JSON.stringify({
        customer,
        transaction,
        storeName: 'আপনার দোকানের নাম'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    console.log('Email sent successfully')
  } catch (error) {
    console.error('Email sending failed:', error)
  }
}
```

## Environment Variables Needed

Add these to your Supabase project:

- `SENDGRID_API_KEY`: Your SendGrid API key
- `RESEND_API_KEY`: Your Resend API key (if using Resend)
- `RESEND_SENDER_EMAIL`: Your verified Resend sender email address
- `SMTP_HOST`: SMTP host (if using SMTP)
- `SMTP_PORT`: SMTP port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password

## Next Steps

1. Choose your email service provider
2. Set up the Edge Function
3. Configure environment variables
4. Test the email functionality
5. Update the TransactionForm component to call the function 