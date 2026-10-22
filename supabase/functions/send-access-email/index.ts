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

    // 🌟 全站大一統：徹底廢除彩色 Emoji，採用與網站一致之 Lucide 線條向量圖示 (SVG)
    // 🌟 引入手機版響應式自適應樣式，釋放兩側被壓縮的空間
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>心願守護時空憑證</title>
        <style>
          @media only screen and (max-width: 480px) {
            .email-outer-table {
              padding: 24px 8px !important;
            }
            .email-card-container {
              padding: 28px 18px !important;
              border-radius: 20px !important;
            }
            .email-cta-btn {
              display: block !important;
              width: 100% !important;
              box-sizing: border-box !important;
              text-align: center !important;
              padding: 15px 12px !important;
            }
            .email-wish-title {
              font-size: 16px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070714; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-outer-table" style="background-color: #070714; padding: 40px 15px;">
          <tr>
            <td align="center">
              
              <!-- 全息卡牌容器（深空曜石 + 琥珀金微光細邊） -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-card-container" style="max-width: 520px; background: linear-gradient(165deg, #14122d 0%, #0a0918 100%); border: 1.5px solid rgba(251, 191, 36, 0.4); border-radius: 28px; padding: 40px 32px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.12);">
                
                <!-- 品牌頂部（採用 Lucide 沙漏線條圖示） -->
                <tr>
                  <td align="center" style="padding-bottom: 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-size: 21px; font-weight: 900; letter-spacing: 1.5px; color: #fde68a;">
                      <!-- Lucide Hourglass 線條圖示 -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; display: inline-block; margin-right: 6px;">
                        <path d="M5 22h14"/>
                        <path d="M5 2h14"/>
                        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                      </svg>
                      <span>夢沙 DreamSand</span>
                    </div>
                    <div style="display: inline-block; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 99px; padding: 4px 14px; margin-top: 10px; font-size: 11px; font-weight: bold; color: #fbbf24; font-family: monospace; letter-spacing: 0.8px;">
                      ✦ 星砂追番專屬免阻斷憑證 · 永久典藏 ✦
                    </div>
                  </td>
                </tr>

                <!-- 稱謂與祝賀 -->
                <tr>
                  <td style="padding-top: 26px; font-size: 15px; line-height: 1.8; color: #cbd5e1;">
                    親愛的星旅人 <b style="color: #fde68a; font-size: 16px;">${toName}</b>：<br>
                    感謝您剛才投入了 <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 1px 8px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: 800; color: #fbbf24;">${amount} 顆虛擬星星</span>，這段築夢前行的微光因您的守護而更加明亮。
                  </td>
                </tr>

                <!-- 守護心願卡牌條（採用 Lucide Compass 羅盤線條圖示） -->
                <tr>
                  <td style="padding: 18px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 0, 0, 0.55); border-left: 3.5px solid #f59e0b; border-radius: 14px; padding: 16px 18px; box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);">
                      <tr>
                        <td>
                          <div style="font-size: 11px; color: #94a3b8; font-weight: bold; letter-spacing: 1px;">
                            <!-- Lucide Compass 線條圖示 -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; display: inline-block; margin-right: 4px;">
                              <circle cx="12" cy="12" r="10"/>
                              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                            </svg>
                            <span>守護對象主題活動</span>
                          </div>
                          <div class="email-wish-title" style="font-size: 17px; font-weight: 900; color: #ffffff; margin-top: 6px; line-height: 1.4;">
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

                <!-- 🌟 核心 CTA 按鈕（自帶 Lucide Sparkles + ArrowRight 向量線條圖示） -->
                <tr>
                  <td align="center" style="padding: 30px 0 34px 0;">
                    <a href="${accessLink}" target="_blank" class="email-cta-btn" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #09090b !important; text-decoration: none; font-weight: 900; font-size: 14px; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45); letter-spacing: 0.6px;">
                      <!-- Lucide Sparkles 線條圖示 -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2.5px; display: inline-block; margin-right: 6px;">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                      </svg>
                      <span>進入專屬心願追番結局室</span>
                      <!-- Lucide ArrowRight 線條圖示 -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2.5px; display: inline-block; margin-left: 6px;">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </a>
                  </td>
                </tr>

                <!-- 頁尾聲明 -->
                <tr>
                  <td align="center" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; font-size: 11px; color: #475569; line-height: 1.6;">
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