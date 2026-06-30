import type { ChatMessage, ChatThread } from '@/types'

export const chatThreads: ChatThread[] = [
  {
    id: 't_1',
    participantIds: ['u_buyer', 'u_seller_tata'],
    subject: 'Tata Tiscon TMT — bulk enquiry',
    channel: 'whatsapp',
    whatsappPhone: '919812000003',
    lastMessageAt: new Date(Date.now() - 5400_000).toISOString(),
  },
  {
    id: 't_2',
    participantIds: ['u_buyer', 'u_seller_acc'],
    subject: 'ACC Cement — order BM-10231',
    channel: 'in_app',
    lastMessageAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: 't_3',
    participantIds: ['u_buyer2', 'u_admin'],
    subject: 'Support — refund for BM-10303',
    channel: 'in_app',
    lastMessageAt: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: 't_4',
    participantIds: ['u_buyer3', 'u_seller_kajaria'],
    subject: 'Kajaria tiles — dye lot match',
    channel: 'whatsapp',
    whatsappPhone: '919812000008',
    lastMessageAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
]

export const chatMessages: ChatMessage[] = [
  // Thread 1
  {
    id: 'm_1',
    threadId: 't_1',
    senderId: 'u_buyer',
    body: 'Hi, I need 25 tons of Fe-550 12mm for a project. Best rate?',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: 'm_2',
    threadId: 't_1',
    senderId: 'u_seller_tata',
    body: 'Hello! For 25 tons we can offer ₹56,800/ton incl. delivery. GST extra.',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 5.5 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: 'm_3',
    threadId: 't_1',
    senderId: 'u_buyer',
    body: 'Can you do ₹56,000? I will confirm today.',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    read: false,
  },
  // Thread 2
  {
    id: 'm_4',
    threadId: 't_2',
    senderId: 'u_buyer',
    body: 'My cement order shows delivered but I received 48 bags, not 50.',
    channel: 'in_app',
    createdAt: new Date(Date.now() - 2.1 * 86400_000).toISOString(),
    read: true,
  },
  {
    id: 'm_5',
    threadId: 't_2',
    senderId: 'u_seller_acc',
    body: 'Apologies! We will dispatch the remaining 2 bags tomorrow free of cost.',
    channel: 'in_app',
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    read: true,
  },
  // Thread 3
  {
    id: 'm_6',
    threadId: 't_3',
    senderId: 'u_buyer2',
    body: 'I cancelled BM-10303 but refund not received yet.',
    channel: 'in_app',
    createdAt: new Date(Date.now() - 1.2 * 86400_000).toISOString(),
    read: true,
  },
  {
    id: 'm_7',
    threadId: 't_3',
    senderId: 'u_admin',
    body: 'Refund of ₹2,01,000 has been initiated, reflects in 3-5 working days.',
    channel: 'in_app',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    read: false,
  },
  // Thread 4
  {
    id: 'm_8',
    threadId: 't_4',
    senderId: 'u_buyer3',
    body: 'Need 200 boxes of the 600x600 vitrified, same dye lot please.',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 3.1 * 86400_000).toISOString(),
    read: true,
  },
  {
    id: 'm_9',
    threadId: 't_4',
    senderId: 'u_seller_kajaria',
    body: 'Sure, we have 220 boxes from a single batch. Shall I block them?',
    channel: 'whatsapp',
    createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    read: true,
  },
]
