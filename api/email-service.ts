import { Resend } from 'resend';

/**
 * Returns the destination email for internal website-generated notifications.
 *
 * Rules:
 * 1. RESEND_NOTIFICATION_EMAIL is the dedicated environment variable for internal alerts (e.g., business Gmail).
 * 2. If RESEND_NOTIFICATION_EMAIL is not set, checks NOTIFICATION_EMAIL for backward compatibility,
 *    but ignores the default 'orders@bastanzibeef.com' so website alerts are NOT routed to the Lockally mailbox
 *    unless explicitly configured in RESEND_NOTIFICATION_EMAIL.
 * 3. Never returns a hardcoded email address.
 */
export function getInternalNotificationEmail(): string {
  const dedicated = (process.env.RESEND_NOTIFICATION_EMAIL || '').trim();
  if (dedicated) {
    return dedicated;
  }

  const legacy = (process.env.NOTIFICATION_EMAIL || '').trim();
  if (legacy && legacy !== 'orders@bastanzibeef.com') {
    return legacy;
  }

  return '';
}

/**
 * Gets configured Resend client and sender details safely without leaking secrets.
 */
export function getResendClient(): {
  client: Resend | null;
  hasKey: boolean;
  fromEmail: string;
} {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const hasKey = Boolean(apiKey && apiKey.length > 5);
  const fromEmail =
    (process.env.RESEND_FROM_EMAIL || '').trim() || 'Bastanzi Beef <orders@bastanzibeef.com>';

  if (!hasKey) {
    return { client: null, hasKey: false, fromEmail };
  }

  try {
    const client = new Resend(apiKey);
    return { client, hasKey: true, fromEmail };
  } catch (err: any) {
    console.error('[EmailService] Failed to initialize Resend client:', err?.message || err);
    return { client: null, hasKey: true, fromEmail };
  }
}

export interface SendEmailOptions {
  type: string; // e.g., 'reservation_confirmation', 'reservation_internal_alert', 'contact_inquiry', 'order_status_customer', 'order_status_internal', 'chat_escalation'
  category: 'customer' | 'internal';
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromOverride?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
  senderUsed?: string;
}

/**
 * Standardized email sending function with server-side diagnostic logging.
 * Adheres strictly to security requirements:
 * - Logs notification type, recipient category, whether Resend key exists, response ID / error message.
 * - Never logs full API keys, passwords, or secrets.
 * - Retries with onboarding@resend.dev if primary domain is unverified in Resend.
 */
export async function sendEmailWithDiagnostics(options: SendEmailOptions): Promise<SendEmailResult> {
  const { type, category, to, subject, html, text, fromOverride } = options;
  const { client, hasKey, fromEmail } = getResendClient();

  const cleanTo = (to || '').trim();

  // Internal notification handling when recipient is not configured
  if (category === 'internal' && !cleanTo) {
    console.warn(
      `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | Status: SKIPPED (RESEND_NOTIFICATION_EMAIL is not configured in environment settings)`
    );
    return {
      success: false,
      skipped: true,
      error: 'RESEND_NOTIFICATION_EMAIL is not configured.',
    };
  }

  if (!cleanTo) {
    console.warn(
      `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | Status: FAILED (Empty recipient email)`
    );
    return {
      success: false,
      error: 'Recipient email is missing.',
    };
  }

  // When Resend API key is not configured, simulate success in dev/test safely
  if (!client || !hasKey) {
    console.log(
      `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | To: ${cleanTo} | Resend Key Exists: false | Status: SIMULATED_SUCCESS (Resend API key not set)`
    );
    return {
      success: true,
      id: `sim_${Date.now()}`,
      senderUsed: fromOverride || fromEmail,
    };
  }

  let sender = fromOverride || fromEmail;
  let response: any = null;

  try {
    response = await client.emails.send({
      from: sender,
      to: [cleanTo],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    });

    // Check for domain verification failure and attempt fallback
    if (
      response.error &&
      response.error.message &&
      (response.error.message.includes('domain') ||
        response.error.message.includes('verify') ||
        response.error.message.includes('not owned') ||
        response.error.message.includes('validation_error'))
    ) {
      console.warn(
        `[Resend Diagnostics] Primary sender (${sender}) unverified. Retrying with onboarding@resend.dev...`
      );
      sender = 'Bastanzi Beef <onboarding@resend.dev>';
      response = await client.emails.send({
        from: sender,
        to: [cleanTo],
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      });
    }

    if (response.error) {
      const errMsg = response.error.message || 'Unknown Resend error';
      console.error(
        `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | To: ${cleanTo} | Resend Key Exists: true | Error: ${errMsg}`
      );
      return {
        success: false,
        error: errMsg,
        senderUsed: sender,
      };
    }

    const emailId = response.data?.id || `id_${Date.now()}`;
    console.log(
      `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | To: ${cleanTo} | Resend Key Exists: true | Success ID: ${emailId}`
    );

    return {
      success: true,
      id: emailId,
      senderUsed: sender,
    };
  } catch (err: any) {
    const errMsg = err?.message || 'Resend network or execution exception';
    console.error(
      `[Resend Diagnostics] Type: [${type}] | Category: [${category}] | To: ${cleanTo} | Resend Key Exists: true | Exception: ${errMsg}`
    );
    return {
      success: false,
      error: errMsg,
      senderUsed: sender,
    };
  }
}
