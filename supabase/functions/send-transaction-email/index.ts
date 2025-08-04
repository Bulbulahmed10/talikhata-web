import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.13";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionEmailRequest {
  customerEmail: string;
  customerName: string;
  transactionType: "given" | "received";
  amount: number;
  note?: string;
  businessName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerEmail,
      customerName,
      transactionType,
      amount,
      note,
      businessName
    }: TransactionEmailRequest = await req.json();

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    const subject = transactionType === "given"
      ? `New Transaction: You received ${amount} BDT from ${businessName}`
      : `Payment Confirmation: You paid ${amount} BDT to ${businessName}`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Notification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f2f2f7;
            color: #1c1c1e;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e5ea;
        }
        .header {
            background-color: #007aff;
            color: white;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 24px;
        }
        .message {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .details-table th, .details-table td {
            padding: 12px 0;
            text-align: left;
            border-bottom: 1px solid #e5e5ea;
        }
        .details-table th {
            color: #6c6c70;
            font-weight: 500;
        }
        .details-table td {
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #8a8a8e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Transaction Receipt</h1>
        </div>
        <div class="content">
            <p class="message">Hello ${customerName},</p>
            <p>This email confirms a recent transaction on your account with <strong>${businessName}</strong>.</p>
            <table class="details-table">
                <tr>
                    <th>Transaction Type</th>
                    <td>${transactionType === 'given' ? 'Credit' : 'Debit'}</td>
                </tr>
                <tr>
                    <th>Amount</th>
                    <td>${amount} BDT</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                ${note ? `<tr><th>Note</th><td>${note}</td></tr>` : ''}
            </table>
        </div>
        <div class="footer">
            <p>Thank you for your business.</p>
            <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: Deno.env.get("GMAIL_USER"),
            pass: Deno.env.get("GMAIL_APP_PASSWORD"),
        },
    });

    const mailOptions = {
        from: `"${businessName}" <${Deno.env.get("GMAIL_USER")}>`,
        to: customerEmail,
        subject: subject,
        html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending transaction email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
