import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionEmailRequest {
  customerEmail: string;
  customerName: string;
  transactionType: "given" | "received";
  amount: number;
  previousBalance: number;
  newBalance: number;
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
      previousBalance,
      newBalance,
      note,
      businessName
    }: TransactionEmailRequest = await req.json();

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    const isDebt = transactionType === "given";
    const isPayment = transactionType === "received";
    
    const subject = isDebt 
      ? `New Transaction: You owe ${amount} BDT to ${businessName}`
      : `Payment Received: ${amount} BDT from ${businessName}`;

    const transactionMessage = isDebt
      ? `You have received ${amount} BDT from ${businessName}`
      : `You have paid ${amount} BDT to ${businessName}`;

    const balanceMessage = newBalance > 0
      ? `You currently owe ${Math.abs(newBalance)} BDT to ${businessName}`
      : newBalance < 0
      ? `${businessName} owes you ${Math.abs(newBalance)} BDT`
      : `Your account is settled with ${businessName}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Transaction Notification</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">From ${businessName}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
          <div style="background: ${isDebt ? '#fef3cd' : '#d1edff'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: ${isDebt ? '#856404' : '#004085'}; font-size: 18px;">
              ${transactionMessage}
            </h2>
            <p style="margin: 0; color: ${isDebt ? '#856404' : '#004085'}; font-size: 16px; font-weight: bold;">
              Amount: ${amount} BDT
            </p>
          </div>

          ${note ? `
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Note:</h3>
              <p style="margin: 0; color: #666; font-style: italic;">${note}</p>
            </div>
          ` : ''}

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Account Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #dee2e6;">Previous Balance:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #dee2e6;">
                  ${previousBalance} BDT
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #dee2e6;">Transaction Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #dee2e6;">
                  ${isDebt ? '+' : '-'}${amount} BDT
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0 8px 0; color: #333; font-weight: bold; font-size: 16px;">Current Balance:</td>
                <td style="padding: 12px 0 8px 0; font-weight: bold; text-align: right; font-size: 16px; color: ${newBalance > 0 ? '#dc3545' : newBalance < 0 ? '#28a745' : '#6c757d'};">
                  ${newBalance} BDT
                </td>
              </tr>
            </table>
          </div>

          <div style="background: ${newBalance > 0 ? '#f8d7da' : newBalance < 0 ? '#d4edda' : '#e2e3e5'}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: ${newBalance > 0 ? '#721c24' : newBalance < 0 ? '#155724' : '#383d41'}; font-weight: bold;">
              ${balanceMessage}
            </p>
          </div>

          <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              This is an automated notification from ${businessName}.<br>
              Transaction recorded on ${new Date().toLocaleDateString('en-BD', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'Asia/Dhaka'
              })}
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "TallyKhata <onboarding@resend.dev>",
      to: [customerEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log("Transaction email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
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