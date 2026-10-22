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

    if (!toEmail || !accessLink) {
      throw new Error('收件信箱或專屬連結參數缺失');
    }

    // 🌟 極簡奢華·全息鍛金信件樣式（徹底拔除冗贅備用長網址）
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>心願守護時空憑證</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070714; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070714; padding: 45px 15px;">
          <tr>
            <td align="center">
              
              <!-- 全息卡牌容器（深空曜石 + 琥珀金微光細邊） -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background: linear-gradient(165deg, #14122d 0%, #0a0918 100%); border: 1.5px solid rgba(251, 191, 36, 0.4); border-radius: 28px; padding: 42px 34px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.12);">
                
                <!-- 品牌頂部 -->
                <tr>
                  <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 1.5px; color: #fde68a;">
                      ⏳ 夢沙 DreamSand
                    </div>
                    <div style="display: inline-block; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 99px; padding: 4px 16px; margin-top: 10px; font-size: 11px; font-weight: bold; color: #fbbf24; font-family: monospace; letter-spacing: 1px;">
                      ✦ 星砂追番專屬免阻斷憑證 · 永久典藏 ✦
                    </div>
                  </td>
                </tr>

                <!-- 稱謂與祝賀 -->
                <tr>
                  <td style="padding-top: 30px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">
                    親愛的星旅人 <b style="color: #fde68a; font-size: 16px;">${toName}</b>：<br>
                    感謝您剛才投入了 <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 1px 8px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: 800; color: #fbbf24;">${amount} 顆虛擬星星</span>，這段築夢前行的微光因您的守護而更加明亮。
                  </td>
                </tr>

                <!-- 守護心願卡牌條 -->
                <tr>
                  <td style="padding: 22px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 0, 0, 0.55); border-left: 3.5px solid #f59e0b; border-radius: 16px; padding: 18px 22px; box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);">
                      <tr>
                        <td>
                          <div style="font-size: 11px; color: #94a3b8; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                            ✦ 守護心願主題
                          </div>
                          <div style="font-size: 17px; font-weight: 900; color: #ffffff; margin-top: 6px; line-height: 1.4;">
                            ${wishTitle}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 履約時空說明 -->
                <tr>
                  <td style="font-size: 13px; line-height: 1.8; color: #94a3b8;">
                    依據星空時空規範，活動達成並換日後將自動自首頁淡出封存。您可憑藉此封專屬時空信函，<b style="color: #e2e8f0;">免登入永久穿透回訪心願時空室</b>，隨時重溫創作者的開箱感謝信與您的漂流瓶加油星語：
                  </td>
                </tr>

                <!-- 🌟 核心 CTA 按鈕（純粹聚焦，無任何冗贅文字干擾） -->
                <tr>
                  <td align="center" style="padding: 36px 0 38px 0;">
                    <a href="${accessLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #09090b !important; text-decoration: none; font-weight: 900; font-size: 14px; padding: 16px 42px; border-radius: 16px; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45); letter-spacing: 0.8px;">
                      ✨ 進入專屬心願追番結局室 ➔
                    </a>
                  </td>
                </tr>

                <!-- 頁尾聲明 -->
                <tr>
                  <td align="center" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 22px; font-size: 11px; color: #475569; line-height: 1.7;">
                    此信件由夢沙 DreamSand 系統自動發送 · 線上數位加油與虛擬卡牌互動平台<br>
                    ✦ 此憑證為永久有效時空密鑰，為您永久典藏這段美好的築夢結局。
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