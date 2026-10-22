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

    // 🌟 採用雙單元格中線強制作齊（valign="middle" + line-height: 1），徹底解決高低歪斜問題
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
              padding: 15px 10px !important;
            }
            .email-wish-title {
              font-size: 16px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070714; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-outer-table" style="background-color: #070714; padding: 40px 15px;">
          <tr>
            <td align="center">
              
              <!-- 全息卡牌容器（深空曜石 + 琥珀金微光細邊） -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-card-container" style="max-width: 520px; background: linear-gradient(165deg, #14122d 0%, #0a0918 100%); border: 1.5px solid rgba(251, 191, 36, 0.4); border-radius: 28px; padding: 40px 32px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.12);">
                
                <!-- 品牌頂部（🌟 採用絕對幾何垂直置中結構，徹底解決歪斜） -->
                <tr>
                  <td align="center" style="padding-bottom: 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto; display: inline-table; vertical-align: middle;">
                      <tr>
                        <td valign="middle" style="vertical-align: middle; padding-right: 8px; line-height: 1;">
                          <span style="color: #fbbf24; font-size: 17px; line-height: 1; display: block;">✦</span>
                        </td>
                        <td valign="middle" style="vertical-align: middle; line-height: 1;">
                          <span style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #fde68a; line-height: 1; display: block;">
                            夢沙 DreamSand
                          </span>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="display: block; margin-top: 10px;">
                      <span style="display: inline-block; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 99px; padding: 4px 14px; font-size: 11px; font-weight: bold; color: #fbbf24; font-family: monospace; letter-spacing: 0.8px;">
                        ✦ 星砂追番專屬免阻斷憑證 · 永久典藏 ✦
                      </span>
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

                <!-- 守護心願卡牌條（🌟 圖示與標題幾何置中鎖定） -->
                <tr>
                  <td style="padding: 18px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 0, 0, 0.55); border-left: 3.5px solid #f59e0b; border-radius: 14px; padding: 16px 18px; box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);">
                      <tr>
                        <td>
                          <table role="presentation" cellspacing="0" cellpadding="0" style="display: inline-table; vertical-align: middle;">
                            <tr>
                              <td valign="middle" style="vertical-align: middle; padding-right: 6px; line-height: 1;">
                                <span style="color: #f59e0b; font-size: 13px; line-height: 1; display: block;">◈</span>
                              </td>
                              <td valign="middle" style="vertical-align: middle; line-height: 1;">
                                <span style="font-size: 11px; color: #94a3b8; font-weight: bold; letter-spacing: 1px; line-height: 1; display: block;">
                                  守護對象主題活動
                                </span>
                              </td>
                            </tr>
                          </table>
                          <div class="email-wish-title" style="font-size: 17px; font-weight: 900; color: #ffffff; margin-top: 8px; line-height: 1.4;">
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

                <!-- 🌟 核心 CTA 按鈕（按鈕內圖示與文字 100% 幾何水平垂直居中） -->
                <tr>
                  <td align="center" style="padding: 30px 0 34px 0;">
                    <a href="${accessLink}" target="_blank" class="email-cta-btn" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #09090b !important; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45);">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto; display: inline-table; vertical-align: middle;">
                        <tr>
                          <td valign="middle" style="vertical-align: middle; padding-right: 6px; line-height: 1;">
                            <span style="font-size: 13px; color: #09090b; line-height: 1; display: block;">✦</span>
                          </td>
                          <td valign="middle" style="vertical-align: middle; line-height: 1;">
                            <span style="font-size: 14px; font-weight: 900; color: #09090b; letter-spacing: 0.6px; line-height: 1; display: block;">
                              進入專屬心願追番結局室
                            </span>
                          </td>
                          <td valign="middle" style="vertical-align: middle; padding-left: 6px; line-height: 1;">
                            <span style="font-size: 14px; font-weight: 900; color: #09090b; line-height: 1; display: block;">➔</span>
                          </td>
                        </tr>
                      </table>
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