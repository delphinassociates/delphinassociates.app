import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Re-verifies the user's session and ensures they have the ADMIN role.
 * Use this at the start of any Admin Server Action.
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('[Security] Unauthorized access attempt: No valid session.')
    throw new Error('Unauthorized: Authentication required')
  }

  const role = user.app_metadata?.userRole
  if (role !== 'ADMIN') {
    console.error(`[Security] Forbidden access attempt by ${user.email}. Role: ${role}`)
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

/**
 * Re-verifies the user's session.
 * Use this at the start of any Supervisor or shared Server Action.
 */
export async function verifyAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('[Security] Unauthorized access attempt: No valid session.')
    throw new Error('Unauthorized: Authentication required')
  }

  return user
}

/**
 * Strips sensitive fields like passwords from objects before logging.
 */
export function sanitizeLog(data: any) {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = { ...data }
  const sensitiveKeys = ['password', 'token', 'key', 'secret']
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLog(sanitized[key])
    }
  }
  
  return sanitized
}
