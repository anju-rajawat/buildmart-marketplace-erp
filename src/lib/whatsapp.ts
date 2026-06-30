/**
 * WhatsApp integration abstraction.
 *
 * The app ships with a MOCK provider so chat works fully offline with dummy data.
 * To go live, implement `CloudApiWhatsAppProvider` against the WhatsApp Business
 * Cloud API and swap the export at the bottom — a one-line change.
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface OutgoingMessage {
  to: string // recipient phone in E.164 (e.g. 919876543210)
  body: string
}

export interface SendResult {
  ok: boolean
  channelMessageId: string
  deliveredAt: string
}

export interface WhatsAppProvider {
  readonly id: string
  send(message: OutgoingMessage): Promise<SendResult>
  /** Returns a `wa.me` deep link that really opens WhatsApp on any device. */
  deepLink(phone: string, prefilledText?: string): string
}

/** Strip everything but digits so wa.me / Cloud API accept the number. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * Mock provider — simulates send/receive without any network or credentials.
 * Resolves after a short delay to mimic async delivery.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  readonly id = 'mock'

  async send(message: OutgoingMessage): Promise<SendResult> {
    await new Promise((r) => setTimeout(r, 350))
    return {
      ok: true,
      channelMessageId: `wamid.mock.${Math.abs(hash(message.to + message.body))}`,
      deliveredAt: new Date().toISOString(),
    }
  }

  deepLink(phone: string, prefilledText = ''): string {
    const text = prefilledText ? `?text=${encodeURIComponent(prefilledText)}` : ''
    return `https://wa.me/${normalizePhone(phone)}${text}`
  }
}

/**
 * Production provider skeleton. Fill in token + phoneNumberId from env/config and
 * uncomment the fetch call to go live.
 */
export class CloudApiWhatsAppProvider implements WhatsAppProvider {
  readonly id = 'cloud-api'
  constructor(
    private token: string,
    private phoneNumberId: string,
  ) {}

  async send(message: OutgoingMessage): Promise<SendResult> {
    // const res = await fetch(
    //   `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${this.token}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       messaging_product: 'whatsapp',
    //       to: normalizePhone(message.to),
    //       type: 'text',
    //       text: { body: message.body },
    //     }),
    //   },
    // )
    // const json = await res.json()
    // return { ok: res.ok, channelMessageId: json.messages?.[0]?.id ?? '', deliveredAt: new Date().toISOString() }
    throw new Error('CloudApiWhatsAppProvider not configured — add token & phoneNumberId.')
  }

  deepLink(phone: string, prefilledText = ''): string {
    const text = prefilledText ? `?text=${encodeURIComponent(prefilledText)}` : ''
    return `https://wa.me/${normalizePhone(phone)}${text}`
  }
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

// --- Swap this single line to go live -------------------------------------
export const whatsapp: WhatsAppProvider = new MockWhatsAppProvider()
// export const whatsapp: WhatsAppProvider = new CloudApiWhatsAppProvider(import.meta.env.VITE_WA_TOKEN, import.meta.env.VITE_WA_PHONE_ID)
