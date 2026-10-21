// supabase/functions/send-access-email/index.ts

// 🌟 宣告 Deno 環境全域物件，讓前端 VS Code 不再報紅字錯誤
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
  toEmail: string;
  toName: string;
  wishId: string;
  wishTitle: string;
  amount: number;
  accessLink: string;
}

Deno.serve(async (req: Request) => {
  // 處理瀏覽器 CORS OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { toEmail, toName, wishTitle, amount, accessLink } = (await req.json()) as RequestPayload;

    // 從 Supabase Secrets 取出金鑰
    const apiKey = Deno.env.get('BREVO_API_KEY');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');

    if (!apiKey || !senderEmail) {
      throw new Error('Supabase Secrets 尚未設定 BREVO_API_KEY 或 BREVO_SENDER_EMAIL');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #e8e6f0; }
          .container { max-width: 580px; margin: 40px auto; background: #121026; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 24px; padding: 36px; box-shadow: 0 0 30px rgba(0,0,0,0.8); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
          .logo { font-size: 22px; font-weight: bold; color: #fde68a; letter-spacing: 1px; }
          .badge { display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fde68a; font-size: 11px; padding: 4px 12px; border-radius: 99px; margin-top: 10px; }
          .content { margin: 28px 0; line-height: 1.7; font-size: 14px; color: #cbd5e1; }
          .wish-box { background: rgba(0,0,0,0.4); border-left: 3px solid #f59e0b; padding: 14px 18px; border-radius: 12px; margin: 18px 0; }
          .btn-wrap { text-align: center; margin: 36px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #09090b !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); }
          .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⏳ 夢沙 DreamSand</div>
            <div class="badge">✦ 星砂追番專屬免阻斷憑證 ✦</div>
          </div>
          
          <div class="content">
            <p>親愛的星旅人 <b>${toName}</b> 您好：</p>
            <p>感謝您為心願投入了 <b>${amount} 顆虛擬星星</b>，點亮前行者的微光！</p>
            
            <div class="wish-box">
              <div style="font-size: 12px; color: #94a3b8;">守護對象：</div>
              <div style="font-size: 15px; font-weight: bold; color: #fde68a; margin-top: 4px;">${wishTitle}</div>
            </div>

            <p>依據星空規範，本活動達成並換日後將自首頁封存。您可隨時透過下方專屬連結，<b>免登入直接回訪專屬時空室</b>，查閱創作者的開箱感謝信與漂流瓶留言：</p>
            
            <div class="btn-wrap">
              <a href="${accessLink}" target="_blank" class="btn">✨ 進入專屬心願追番結局室</a>
            </div>

            <p style="font-size: 11px; color: #64748b; text-align: center;">若按鈕無法點擊，可複製此連結至瀏覽器：<br><a href="${accessLink}" style="color: #f59e0b; word-break: break-all;">${accessLink}</a></p>
          </div>

          <div class="footer">
            此信件由夢沙 DreamSand 系統自動發送 · 線上數位加油與虛擬卡牌互動平台<br>
            憑證有效期限為 30 天，請妥善留存。
          </div>
        </div>
      </body>
      </html>
    `;

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: '夢沙 DreamSand', email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject: `【夢沙 DreamSand】您的心願守護專屬憑證已送達：${wishTitle}`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.text();
      throw new Error(`Brevo API 錯誤: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});