'use server'

import { createClient } from '@/lib/supabase/server'
import { DailyReport, Site, User, WorkAllocation } from '@/types/database'
import { getCurrentISTDateString } from '@/lib/date-utils'

export async function getDashboardSummary() {
  const supabase = await createClient()

  // 1. Total Active Sites
  const { data: activeSites } = await supabase
    .from('sites')
    .select('*')
    .eq('status', 'ACTIVE')

  const activeSitesCount = activeSites?.length || 0

  // 2. Total Supervisors
  const { count: totalSupervisors } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'SUPERVISOR')

  // 3. Today's submissions (IST)
  const today = getCurrentISTDateString()
  const { data: todayReports } = await supabase
    .from('daily_reports')
    .select(`
      labour_entries(count),
      labour_advance_entries(amount),
      material_expense_entries(amount)
    `)
    .eq('report_date', today)
    .eq('deleted', false)

  let totalLabourToday = 0
  let todayLabourAdvance = 0
  let todayMaterialExpense = 0

  todayReports?.forEach(r => {
    r.labour_entries?.forEach((le: any) => totalLabourToday += le.count)
    r.labour_advance_entries?.forEach((la: any) => todayLabourAdvance += Number(la.amount))
    r.material_expense_entries?.forEach((me: any) => todayMaterialExpense += Number(me.amount))
  })

  // 4. Holiday check
  const { data: holiday } = await supabase
    .from('holidays')
    .select('name')
    .eq('date', today)
    .single()

  // 5. Compliance Monitoring (Pending Reports)
  const allPending = await getPendingSites()
  const totalPendingCount = allPending.length

  // Overall Compliance Rate (Last 30 Days)
  const todayStr = getCurrentISTDateString()
  const todayDate = new Date(todayStr)
  const earliestDate = new Date(todayDate)
  earliestDate.setDate(earliestDate.getDate() - 30)
  
  const year = earliestDate.getFullYear();
  const month = String(earliestDate.getMonth() + 1).padStart(2, '0');
  const day = String(earliestDate.getDate()).padStart(2, '0');
  const earliestStr = `${year}-${month}-${day}`;

  const { count: submittedInWindow } = await supabase
    .from('daily_reports')
    .select('*', { count: 'exact', head: true })
    .eq('deleted', false)
    .gte('report_date', earliestStr)
    .lte('report_date', todayStr)

  const totalExpectedReports = (submittedInWindow || 0) + totalPendingCount
  const overallComplianceRate = totalExpectedReports === 0 ? 100 : Math.round(((submittedInWindow || 0) * 100) / totalExpectedReports)

  const isSunday = new Date(todayStr).getDay() === 0

  return {
    totalActiveSites: activeSitesCount,
    totalSupervisors: totalSupervisors || 0,
    todaySubmittedReports: todayReports?.length || 0,
    totalLabourToday,
    todayLabourAdvance,
    todayMaterialExpense,
    totalPendingCount,
    overallComplianceRate,
    todayIsHoliday: !!holiday || isSunday,
    holidayName: holiday?.name || (isSunday ? 'Sunday (Weekly Off)' : null)
  }
}

export async function getRangeSummary(from: string, to: string, siteId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('daily_reports')
    .select(`
      report_id,
      labour_entries(count),
      labour_advance_entries(amount),
      material_expense_entries(amount)
    `)
    .eq('deleted', false)
    .gte('report_date', from)
    .lte('report_date', to)

  if (siteId && siteId !== 'all') {
    query = query.eq('site_id', siteId)
  }

  const { data: reports } = await query

  let totalReports = reports?.length || 0
  let totalLabourPresent = 0
  let totalMaterialExpense = 0
  let totalLabourAdvance = 0

  reports?.forEach(r => {
    r.labour_entries?.forEach((le: any) => totalLabourPresent += le.count)
    r.material_expense_entries?.forEach((me: any) => totalMaterialExpense += Number(me.amount))
    r.labour_advance_entries?.forEach((la: any) => totalLabourAdvance += Number(la.amount))
  })

  return {
    totalReports,
    totalLabourPresent,
    totalMaterialExpense,
    totalLabourAdvance
  }
}

export async function getLabourTrend(from: string, to: string, siteId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('daily_reports')
    .select('report_date, labour_entries(count)')
    .eq('deleted', false)
    .gte('report_date', from)
    .lte('report_date', to)

  if (siteId && siteId !== 'all') {
    query = query.eq('site_id', siteId)
  }

  const { data: reports } = await query

  const trendMap: Record<string, number> = {}
  reports?.forEach(r => {
    const date = r.report_date
    const count = r.labour_entries?.reduce((sum: number, le: any) => sum + le.count, 0) || 0
    trendMap[date] = (trendMap[date] || 0) + count
  })

  return Object.entries(trendMap)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getExpenseTrend(from: string, to: string, siteId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('daily_reports')
    .select('report_date, material_expense_entries(amount)')
    .eq('deleted', false)
    .gte('report_date', from)
    .lte('report_date', to)

  if (siteId && siteId !== 'all') {
    query = query.eq('site_id', siteId)
  }

  const { data: reports } = await query

  const trendMap: Record<string, number> = {}
  reports?.forEach(r => {
    const date = r.report_date
    const amount = r.material_expense_entries?.reduce((sum: number, me: any) => sum + Number(me.amount), 0) || 0
    trendMap[date] = (trendMap[date] || 0) + amount
  })

  return Object.entries(trendMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getMaterialTrend(from: string, to: string, siteId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('daily_reports')
    .select('report_date, material_inward_entries(quantity)')
    .eq('deleted', false)
    .gte('report_date', from)
    .lte('report_date', to)

  if (siteId && siteId !== 'all') {
    query = query.eq('site_id', siteId)
  }

  const { data: reports } = await query

  const trendMap: Record<string, number> = {}
  reports?.forEach(r => {
    const date = r.report_date
    const qty = r.material_inward_entries?.reduce((sum: number, mi: any) => sum + mi.quantity, 0) || 0
    trendMap[date] = (trendMap[date] || 0) + qty
  })

  return Object.entries(trendMap)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getRemainingStock() {
  const supabase = await createClient()

  // 1. Get all active sites
  const { data: sites } = await supabase.from('sites').select('site_id').eq('status', 'ACTIVE')
  
  const aggregatedStock: Record<string, number> = {}

  if (sites) {
    for (const site of sites) {
      // 2. Get the latest report for each site
      const { data: latestReport } = await supabase
        .from('daily_reports')
        .select('report_id, remaining_stock_entries(material_name, quantity)')
        .eq('site_id', site.site_id)
        .eq('deleted', false)
        .order('report_date', { ascending: false })
        .limit(1)
        .single()

      if (latestReport?.remaining_stock_entries) {
        latestReport.remaining_stock_entries.forEach((entry: any) => {
          const material = entry.material_name.trim().toUpperCase()
          // Parse quantity string (e.g., "50 bags" -> 50)
          const qty = parseFloat(entry.quantity.match(/(\d+\.?\d*)/)?.[0] || '1')
          aggregatedStock[material] = (aggregatedStock[material] || 0) + qty
        })
      }
    }
  }

  return Object.entries(aggregatedStock)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))
}

export async function getSiteReportCount() {
  const adminClient = createAdminClient()

  const { data: sites } = await adminClient
    .from('sites')
    .select('site_id, site_name')
  
  const { data: reports } = await adminClient
    .from('daily_reports')
    .select('site_id')
    .eq('deleted', false)

  const counts: Record<number, number> = {}
  reports?.forEach(r => {
    counts[r.site_id] = (counts[r.site_id] || 0) + 1
  })

  return sites?.map(s => ({
    siteName: s.site_name,
    reportCount: counts[s.site_id] || 0
  })) || []
}

export async function getPendingSites() {
  const supabase = await createClient()
  const todayStr = getCurrentISTDateString()
  const today = new Date(todayStr)

  const { data: activeSites } = await supabase
    .from('sites')
    .select('site_id, site_name, site_location, created_at')
    .eq('status', 'ACTIVE')

  if (!activeSites || activeSites.length === 0) return []

  // Earliest date to check (site creation or last 365 days)
  let earliestDate = new Date(Math.min(...activeSites.map(s => new Date(s.created_at).getTime())))
  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - 365)
  if (earliestDate < limitDate) earliestDate = limitDate

  const earliestStr = earliestDate.toISOString().split('T')[0]

  // Fetch all reports and exemptions in range
  const { data: allReports } = await supabase
    .from('daily_reports')
    .select('site_id, report_date')
    .eq('deleted', false)
    .gte('report_date', earliestStr)
    .lte('report_date', todayStr)

  const { data: allExemptions } = await supabase
    .from('work_allocations')
    .select('site_id, allocation_date')
    .eq('work_allocated', false)
    .gte('allocation_date', earliestStr)
    .lte('allocation_date', todayStr)

  const { data: allHolidays } = await supabase
    .from('holidays')
    .select('date')
    .gte('date', earliestStr)
    .lte('date', todayStr)

  const reportSet = new Set(allReports?.map(r => `${r.site_id}_${r.report_date}`) || [])
  const exemptionSet = new Set(allExemptions?.map(e => `${e.site_id}_${e.allocation_date}`) || [])
  const holidaySet = new Set(allHolidays?.map(h => h.date) || [])

  const pending: any[] = []
  let checkDate = new Date(today)

  while (checkDate >= earliestDate) {
    const dStr = checkDate.toISOString().split('T')[0]
    const isSunday = checkDate.getDay() === 0

    if (!isSunday && !holidaySet.has(dStr)) {
      activeSites.forEach(site => {
        const siteCreated = new Date(site.created_at)
        siteCreated.setHours(0,0,0,0)
        
        const currentCheck = new Date(checkDate)
        currentCheck.setHours(0,0,0,0)

        if (currentCheck >= siteCreated) {
          const key = `${site.site_id}_${dStr}`
          if (!reportSet.has(key) && !exemptionSet.has(key)) {
            pending.push({
              siteId: site.site_id,
              siteName: site.site_name,
              siteLocation: site.site_location,
              pendingDate: dStr
            })
          }
        }
      })
    }
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return pending
}

export async function getExemptedSites() {
  const supabase = await createClient()
  const today = getCurrentISTDateString()

  const { data: exemptions } = await supabase
    .from('work_allocations')
    .select('site_id, sites(site_name, site_location)')
    .eq('allocation_date', today)
    .eq('work_allocated', false)

  return exemptions?.map((e: any) => ({
    siteId: e.site_id,
    siteName: e.sites.site_name,
    siteLocation: e.sites.site_location
  })) || []
}

export async function getAllSites() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sites')
    .select('*')
    .order('site_name')
  
  return data?.map(s => ({
    siteId: s.site_id,
    siteName: s.site_name,
    siteLocation: s.site_location,
    clientName: s.client_name,
    projectType: s.project_type,
    status: s.status
  })) || []
}

export async function markNoWork(siteId: number, date: string, remarks: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('work_allocations')
    .upsert({
      site_id: siteId,
      allocation_date: date,
      work_allocated: false,
      remarks
    })
  return { error: error?.message }
}

export async function restoreWork(siteId: number, date: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('work_allocations')
    .delete()
    .eq('site_id', siteId)
    .eq('allocation_date', date)
  return { error: error?.message }
}

export async function getSupervisors() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'SUPERVISOR')
    .order('full_name')
  
  return data?.map(u => ({
    id: u.id,
    fullName: u.full_name,
    username: u.username,
    mobileNumber: u.mobile_number,
    enabled: u.enabled,
    createdAt: u.created_at
  })) || []
}

import { createAdminClient } from '@/lib/supabase/admin'

export async function createSupervisor(payload: any) {
  const adminClient = createAdminClient()
  const supabase = await createClient()
  
  const email = `${payload.username.toLowerCase()}@cdsms.local`
  
  // 1. Create in Supabase Auth via Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.fullName
    },
    app_metadata: {
      userRole: 'SUPERVISOR'
    }
  })

  if (authError) return { error: authError.message }

  // 2. Create in public.users using adminClient to bypass RLS
  const { data: dbUser, error: dbError } = await adminClient
    .from('users')
    .insert({
      full_name: payload.fullName,
      username: payload.username,
      password: payload.password,
      mobile_number: payload.mobileNumber,
      role: 'SUPERVISOR',
      enabled: true
    })
    .select('id')
    .single()

  if (dbError) {
    // Cleanup auth user if DB insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: dbError.message }
  }

  // 3. Update Auth user with the BIGINT id for RLS
  await adminClient.auth.admin.updateUserById(authData.user.id, {
    app_metadata: {
      userId: dbUser.id,
      userRole: 'SUPERVISOR'
    }
  })

  return { success: true }
}



export async function updateSupervisor(id: number, payload: any) {
  console.log('[AuthSync] Received payload:', { id, ...payload, password: payload.password ? '****' : 'hidden' });
  const adminClient = createAdminClient()
  
  // 1. Fetch the OLD profile to get the current username
  const { data: oldProfile, error: fetchError } = await adminClient
    .from('users')
    .select('username')
    .eq('id', id)
    .single()
    
  if (fetchError || !oldProfile) return { error: 'Personnel record not found' }

  const updateData: any = {
    full_name: payload.fullName,
    username: payload.username,
    mobile_number: payload.mobileNumber
  }
  
  if (payload.password) {
    updateData.password = payload.password // This is for our internal record/display if needed
  }

  // 2. Sync with Supabase Auth
  const oldEmail = `${oldProfile.username.toLowerCase()}@cdsms.local`
  const newEmail = `${payload.username.toLowerCase()}@cdsms.local`
  
  console.log(`[AuthSync] Syncing for ${oldEmail}. New email intended: ${newEmail}`);
  
  try {
    const { data: authUsers } = await adminClient.auth.admin.listUsers()
    const authUser = authUsers.users.find(u => u.email?.toLowerCase() === oldEmail)
    
    if (authUser) {
      console.log(`[AuthSync] Found Auth user: ${authUser.id}`);
      const authUpdate: any = {}
      if (payload.password) {
        console.log(`[AuthSync] Updating password for ${authUser.id}`);
        authUpdate.password = payload.password
      }
      if (payload.username.toLowerCase() !== oldProfile.username.toLowerCase()) {
        console.log(`[AuthSync] Updating email to ${newEmail}`);
        authUpdate.email = newEmail
      }
      
      if (Object.keys(authUpdate).length > 0) {
        const { error: authErr } = await adminClient.auth.admin.updateUserById(authUser.id, authUpdate)
        if (authErr) {
          console.error('[AuthSync] Supabase Auth Update Error:', authErr.message)
          return { error: `Authentication sync failed: ${authErr.message}` }
        }
        console.log('[AuthSync] Auth update successful');
      }
    } else {
      console.warn(`[AuthSync] No Auth user found for email: ${oldEmail}`)
      return { error: 'Authentication account not found for this supervisor.' }
    }
  } catch (authErr: any) {
    console.error('[AuthSync] Critical error:', authErr)
    return { error: 'A critical error occurred during authentication synchronization.' }
  }

  // 3. Update DB Profile
  const { error } = await adminClient
    .from('users')
    .update(updateData)
    .eq('id', id)

  return { error: error?.message }
}


export async function deleteSupervisor(id: number) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Find user to get username/email
  const { data: userProfile } = await supabase
    .from('users')
    .select('username')
    .eq('id', id)
    .single()

  if (userProfile) {
    const email = `${userProfile.username}@cdsms.local`
    const { data: users } = await adminClient.auth.admin.listUsers()
    const authUser = users.users.find(u => u.email === email)
    if (authUser) {
      await adminClient.auth.admin.deleteUser(authUser.id)
    }
  }

  const { error } = await adminClient
    .from('users')
    .delete()
    .eq('id', id)
  return { error: error?.message }
}


export async function toggleUserStatus(id: number, currentStatus: boolean) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  const { error } = await adminClient
    .from('users')
    .update({ enabled: !currentStatus })
    .eq('id', id)

  if (!error) {
    // Find the Auth User to ban/unban them immediately
    const { data: userProfile } = await supabase
      .from('users')
      .select('username')
      .eq('id', id)
      .single()

    if (userProfile) {
      const email = `${userProfile.username}@cdsms.local`
      const { data: users } = await adminClient.auth.admin.listUsers()
      const authUser = users.users.find(u => u.email === email)
      
      if (authUser) {
        if (currentStatus) {
          // Banning the user (disabling)
          await adminClient.auth.admin.updateUserById(authUser.id, { ban_duration: '876000h' })
        } else {
          // Unbanning the user (enabling)
          await adminClient.auth.admin.updateUserById(authUser.id, { ban_duration: 'none' })
        }
      }
    }
  }

  return { error: error?.message }
}

export async function createSite(payload: any) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('sites')
    .insert({
      site_name: payload.siteName,
      site_location: payload.siteLocation,
      client_name: payload.clientName,
      project_type: payload.projectType,
      status: payload.status
    })
  return { error: error?.message }
}

export async function updateSite(id: number, payload: any) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('sites')
    .update({
      site_name: payload.siteName,
      site_location: payload.siteLocation,
      client_name: payload.clientName,
      project_type: payload.projectType,
      status: payload.status
    })
    .eq('site_id', id)
  return { error: error?.message }
}

export async function deleteSite(id: number) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('sites')
    .delete()
    .eq('site_id', id)
  return { error: error?.message }
}

export async function getAdminReports() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('daily_reports')
    .select(`
      *,
      site:sites(site_name),
      supervisor:users(full_name),
      labour_entries(count),
      material_expense_entries(amount),
      labour_advance_entries(amount),
      remaining_stock_entries(material_name)
    `)
    .eq('deleted', false)
    .order('report_date', { ascending: false })
  
  return data?.map(r => ({
    reportId: r.report_id,
    reportDate: r.report_date,
    workProgress: r.work_progress,
    remarks: r.remarks,
    updatedAt: r.updated_at,
    site: { siteName: r.site?.site_name },
    supervisor: { fullName: r.supervisor?.full_name },
    labourEntries: r.labour_entries,
    materialExpenses: r.material_expense_entries,
    labourAdvances: r.labour_advance_entries,
    remainingStocks: r.remaining_stock_entries
  })) || []
}

export async function deleteReport(id: number) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('daily_reports')
    .update({ deleted: true })
    .eq('report_id', id)
  return { error: error?.message }
}

export async function restoreReport(id: number) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('daily_reports')
    .update({ deleted: false })
    .eq('report_id', id)
  return { error: error?.message }
}

export async function getReportDetails(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_reports')
    .select(`
      *,
      site:sites(site_name),
      supervisor:users(full_name),
      labourEntries:labour_entries(*),
      materialInwards:material_inward_entries(*),
      materialExpenses:material_expense_entries(*),
      labourAdvances:labour_advance_entries(*),
      remainingStocks:remaining_stock_entries(*),
      photos:report_photos(*)
    `)
    .eq('report_id', id)
    .single()
  
  if (error) return null

  // Map to the expected frontend structure
  return {
    reportId: data.report_id,
    reportDate: data.report_date,
    workProgress: data.work_progress,
    remarks: data.remarks,
    site: { siteName: data.site?.site_name },
    supervisor: { fullName: data.supervisor?.full_name },
    labourEntries: data.labourEntries?.map((le: any) => ({
      labourType: le.labour_type,
      count: le.count
    })),
    materialInwards: data.materialInwards?.map((mi: any) => ({
      materialName: mi.material_name,
      quantity: mi.quantity
    })),
    materialExpenses: data.materialExpenses?.map((me: any) => ({
      materialName: me.material_name,
      amount: me.amount
    })),
    labourAdvances: data.labourAdvances?.map((la: any) => ({
      labourName: la.labour_name,
      amount: la.amount
    })),
    remainingStocks: data.remainingStocks?.map((rs: any) => ({
      materialName: rs.material_name,
      quantity: rs.quantity
    }))
  }
}


export async function getHolidays() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('holidays')
    .select('*')
    .order('date', { ascending: true })
  return data || []
}

export async function createHoliday(payload: any) {
  const supabase = await createClient()
  const { date, toDate, name, description } = payload
  
  if (toDate && toDate !== date) {
    // Range of holidays
    const [startY, startM, startD] = date.split('-').map(Number);
    const start = new Date(startY, startM - 1, startD);
    
    const [endY, endM, endD] = toDate.split('-').map(Number);
    const end = new Date(endY, endM - 1, endD);
    
    const holidays = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      holidays.push({
        date: `${year}-${month}-${day}`,
        name,
        description
      })
    }
    
    const { error } = await supabase.from('holidays').insert(holidays)
    return { error: error?.message }
  } else {
    const { error } = await supabase.from('holidays').insert({ date, name, description })
    return { error: error?.message }
  }
}

export async function deleteHoliday(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id)
  return { error: error?.message }
}





