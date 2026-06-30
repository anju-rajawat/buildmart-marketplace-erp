# WhatsApp Integration

The app integrates WhatsApp through a small **provider abstraction** so it works fully offline today
and can go live with a one-line change. Code lives in [`src/lib/whatsapp.ts`](../src/lib/whatsapp.ts).

## The abstraction

```ts
interface WhatsAppProvider {
  readonly id: string
  send(message: OutgoingMessage): Promise<SendResult>
  deepLink(phone: string, prefilledText?: string): string   // returns a real wa.me link
}
```

Two implementations ship:

| Provider | Purpose |
|---|---|
| `MockWhatsAppProvider` | Default. Simulates `send()` with a short delay — no network, no credentials. |
| `CloudApiWhatsAppProvider` | Skeleton for the **WhatsApp Business Cloud API**; fill in token + phone-number id. |

The active provider is exported at the bottom of the file:

```ts
export const whatsapp: WhatsAppProvider = new MockWhatsAppProvider()
```

## How it's used

- **Chat page** (`src/pages/Chat.tsx`): sending on a `whatsapp` thread calls `whatsapp.send(...)`;
  the thread header shows a **WhatsApp** button built from `whatsapp.deepLink(phone)`.
- **Product page** (`src/pages/buyer/ProductDetail.tsx`): "Chat on WhatsApp" opens
  `whatsapp.deepLink(sellerPhone, prefilledText)` in a new tab and records the thread in-app.
- **Customers** (`src/pages/erp/Customers.tsx`): admin can WhatsApp a customer via the deep link.

`wa.me` deep links are **real** — they open WhatsApp on any device regardless of the provider.

## Going live (WhatsApp Business Cloud API)

1. Create a Meta app and a WhatsApp Business number; get a **permanent access token** and your
   **phone number id**. Docs: <https://developers.facebook.com/docs/whatsapp/cloud-api>
2. Add credentials to a `.env` file (Vite exposes `VITE_`-prefixed vars):

   ```env
   VITE_WA_TOKEN=your_permanent_token
   VITE_WA_PHONE_ID=your_phone_number_id
   ```

3. In `src/lib/whatsapp.ts`, **uncomment** the `fetch` call inside `CloudApiWhatsAppProvider.send`
   and **swap the export**:

   ```ts
   export const whatsapp: WhatsAppProvider = new CloudApiWhatsAppProvider(
     import.meta.env.VITE_WA_TOKEN!,
     import.meta.env.VITE_WA_PHONE_ID!,
   )
   ```

4. **Inbound messages** (replies from customers) require a **webhook**, which needs a server — out of
   scope for this frontend-only demo. When you add a backend, point the webhook at it and feed
   inbound messages into the store's `sendMessage` action (or its API-backed replacement).

> ⚠️ Never ship a real token in frontend code for production — proxy WhatsApp calls through your own
> backend so the token stays server-side. The frontend provider here is for demos and local testing.
