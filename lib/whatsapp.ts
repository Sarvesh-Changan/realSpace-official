import 'server-only';

import prisma from '@/lib/prisma';

type ReraWhatsAppNotification = {
  name: string;
  phone: string;
  email?: string | null;
  interestedIn: string;
  budgetLabel?: string | null;
  locality?: string | null;
  message?: string | null;
  source: string;
  propertyTitle?: string | null;
  details?: Record<string, string> | null;
};

function toWhatsAppRecipient(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

function templateSummary(enquiry: ReraWhatsAppNotification): string {
  const lines = [
    `Source: ${enquiry.source}`,
    enquiry.propertyTitle ? `Property: ${enquiry.propertyTitle}` : null,
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || 'Not provided'}`,
    `Interest: ${enquiry.interestedIn}`,
    `Locality: ${enquiry.locality || 'Not specified'}`,
    `Budget: ${enquiry.budgetLabel || 'Not specified'}`,
    enquiry.message ? `Message: ${enquiry.message}` : null,
    ...Object.entries(enquiry.details ?? {}).map(([key, value]) => `${key}: ${value}`),
  ].filter((line): line is string => Boolean(line));

  // Meta template parameters have length limits; keep the notification concise.
  return lines.join('\n').slice(0, 900);
}

/**
 * Sends an approved WhatsApp template notification to the number stored in
 * RERA admin settings. Missing credentials or delivery errors never affect
 * the enquiry or its email notification.
 */
export async function sendReraWhatsAppNotification(
  enquiry: ReraWhatsAppNotification
): Promise<boolean> {
  try {
    const settings = await prisma.reraSettings.findUnique({
      where: { id: 'singleton' },
      select: { whatsapp: true },
    });
    const recipient = settings?.whatsapp ? toWhatsAppRecipient(settings.whatsapp) : null;
    const token = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION?.trim();
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || 'realspace_enquiry_notification';
    const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || 'en';

    if (!recipient) {
      console.warn('WhatsApp notification skipped: valid recipient number is missing from RERA settings.');
      return false;
    }
    if (!token || !phoneNumberId || !apiVersion) {
      console.warn('WhatsApp notification skipped: Cloud API credentials or API version are not configured.');
      return false;
    }

    const response = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: templateSummary(enquiry) }],
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`WhatsApp notification delivery failed (HTTP ${response.status}).`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      'WhatsApp notification delivery failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false;
  }
}
