import { Resend } from 'resend';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Simulated - RESEND_API_KEY not set] To: ${to}, Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: 'Bastanzi Premium Beef Co. <orders@bastanzibeef.com>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }
}

export function getBrandedEmailWrapper(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050a06; font-family: 'Georgia', 'Times New Roman', serif; color: #f3f4f6;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050a06; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b140f; border: 2px solid #d97706; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background-color: #07100b; border-bottom: 1px solid #1f3e2c;">
                    <h1 style="margin: 0; color: #fef3c7; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                      BASTANZI PREMIUM BEEF CO.
                    </h1>
                    <p style="margin: 5px 0 0 0; color: #fbbf24; font-size: 11px; font-family: monospace; letter-spacing: 3px; text-transform: uppercase;">
                      OGFCARGO Cold Chain Logistics & Ranch Reserves
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 30px; color: #e5e7eb; font-size: 14px; line-height: 1.6;">
                    ${contentHtml}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px; background-color: #050a06; border-top: 1px solid #1f3e2c; font-size: 11px; color: #9ca3af; font-family: monospace;">
                    <p style="margin: 0 0 5px 0;">Bastanzi Premium Beef Co. • Sheridan Ranch Station, Montana</p>
                    <p style="margin: 0; color: #d97706;">Guaranteed Pasture-Raised, Artisan Butchered & Blast-Frozen Cold Chain Shipping</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
