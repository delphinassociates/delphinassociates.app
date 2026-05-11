'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const username = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  const email = `${username.toLowerCase()}@cdsms.local`

  // 1. Sign in with Supabase Auth
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  
  if (signInError) {
    console.error(`Login failure for ${email}`)
    return { error: `Authentication failed: ${signInError.message}` }
  }

  // 2. Use Admin Client to bypass RLS and read the user profile
  const { data: userData, error: profileError } = await adminClient
    .from('users')
    .select('id, role, enabled, full_name')
    .ilike('username', username)
    .single()

  if (profileError || !userData) {
    await supabase.auth.signOut()
    return { error: 'User profile not found. Contact administrator.' }
  }

  // 3. Check if account is enabled
  if (!userData.enabled) {
    await supabase.auth.signOut()
    return { error: 'Account has been disabled. Contact administrator.' }
  }

  // 4. Ensure the Auth user has the correct app_metadata (userId + userRole)
  //    This is important for RLS policies that use jwt.claims.userId
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (authUser) {
    const currentMeta = authUser.app_metadata || {}
    if (!currentMeta.userId || !currentMeta.userRole) {
      await adminClient.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          userId: userData.id,
          userRole: userData.role,
          fullName: userData.full_name
        }
      })
    }
  }

  // 5. Redirect based on role
  if (userData.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else {
    redirect('/supervisor/dashboard')
  }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null

  const username = authUser.email?.split('@')[0].toLowerCase()
  
  // Use adminClient to bypass RLS safely on the server
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('users')
    .select('id, full_name, username, role')
    .ilike('username', username || '')
    .single()

  if (profile) {
    return {
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username,
      role: profile.role
    }
  }
  
  return null
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
