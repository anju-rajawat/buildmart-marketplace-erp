import type { Role } from '@/types'

/**
 * Static login credentials (frontend-only demo — stored in code, no backend).
 *
 * Two login modes:
 *  - "user"  → buyer / purchasing experience  (marketplace)
 *  - "admin" → selling / management panel      (ERP)
 *
 * `userId` links the credential to a seeded User in `data/users.ts`.
 */
export interface Credential {
  mode: 'user' | 'admin'
  username: string
  password: string
  userId: string
  role: Role
}

export const credentials: Credential[] = [
  {
    mode: 'admin',
    username: 'admin',
    password: 'admin123',
    userId: 'u_admin',
    role: 'admin',
  },
  {
    mode: 'user',
    username: 'user',
    password: 'user123',
    userId: 'u_buyer',
    role: 'buyer',
  },
]

/** Validate a login attempt against the static credential list. */
export function authenticate(
  mode: 'user' | 'admin',
  username: string,
  password: string,
): Credential | null {
  return (
    credentials.find(
      (c) =>
        c.mode === mode &&
        c.username.toLowerCase() === username.trim().toLowerCase() &&
        c.password === password,
    ) ?? null
  )
}
