// supabase/functions/send-access-email/index.ts

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { toEmail, toName, wishTitle, amount, accessLink } = (await req.json()) as RequestPayload;

    const apiKey = Deno.env.get('BREVO_API_KEY');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');

    if (!apiKey || !senderEmail) {
      throw new Error('Supabase Secrets 尚未設定 BREVO_API_KEY 或 BREVO_SENDER_EMAIL');
    }

    // 🌟 重新設計之暗夜全息鍛金信件樣式
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>心願守護專屬憑證</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070714; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070714; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 540px; background: linear-gradient(165deg, #13122b 0%, #0c0b1c 100%); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 28px; padding: 40px 32px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);">
                
                <!-- 標題頂部 -->
                <tr>
                  <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-size: 22px; font-weight: 800; color: #fde68a; letter-spacing: 1px;">
                      ⏳ 夢沙 DreamSand
                    </div>
                    <div style="display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 99px; padding: 4px 14px; margin-top: 10px; font-size: 11px; font-weight: bold; color: #fbbf24; font-family: monospace;">
                      ✦ 星砂追番專屬免阻斷憑證 ✦
                    </div>
                  </td>
                </tr>

                <!-- 信件內文 -->
                <tr>
                  <td style="padding-top: 28px; font-size: 14px; line-height: 1.7; color: #cbd5e1;">
                    親愛的星旅人 <b style="color: #fde68a;">${toName}</b> 您好：<br><br>
                    感謝您剛才投入了 <b style="color: #fbbf24; font-family: monospace; font-size: 16px;">${amount} 顆虛擬星星</b>，以星塵微光守護這段前行之旅！
                  </td>
                </tr>

                <!-- 心願資訊卡 -->
                <tr>
                  <td style="padding: 20px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 0, 0, 0.5); border-left: 3px solid #f59e0b; border-radius: 14px; padding: 16px 20px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">守護對象活動：</div>
                          <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 4px;">${wishTitle}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="font-size: 13px; line-height: 1.7; color: #94a3b8;">
                    依據平台履約規範，活動達成並換日後將自動自首頁淡出。您可隨時透過下方專屬憑證按鈕，<b>免登入直接穿透回訪心願時空室</b>，隨時查閱創作者的開箱感謝信與您的漂流瓶星語：
                  </td>
                </tr>

                <!-- 🌟 鍛造琥珀金 CTA 按鈕 -->
                <tr>
                  <td align="center" style="padding: 32px 0;">
                    <a href="${accessLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #09090b !important; text-decoration: none; font-weight: 900; font-size: 14px; padding: 15px 36px; border-radius: 14px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.45); letter-spacing: 0.5px;">
                      ✨ 進入專屬心願追番結局室
                    </a>
                  </td>
                </tr>

                <!-- 備用純文字連結 -->
                <tr>
                  <td align="center" style="font-size: 11px; color: #64748b; line-height: 1.5; padding-bottom: 20px;">
                    若按鈕無法點擊，可複製下方時空連結至瀏覽器開啟：<br>
                    <a href="${accessLink}" target="_blank" style="color: #f59e0b; word-break: break-all;">${accessLink}</a>
                  </td>
                </tr>

                <!-- 頁尾聲明 -->
                <tr>
                  <td align="center" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px; font-size: 11px; color: #475569; line-height: 1.6;">
                    此信件由夢沙 DreamSand 系統自動發送 · 線上數位加油與虛擬卡牌互動平台<br>
                    此專屬免阻斷憑證效期為 30 天，請妥善保存。
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
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