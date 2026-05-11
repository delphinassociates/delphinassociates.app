'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentISTDateString } from '@/lib/date-utils';
import { verifyAuth } from '@/lib/security';

export async function getSupervisorSites(clientDate?: string) {
  try {
    await verifyAuth()
    const supabase = await createClient()

    const adminClient = createAdminClient()

    const { data: sites } = await adminClient
      .from('sites')
      .select('site_id, site_name, client_name, site_location')
      .eq('status', 'ACTIVE')

    const today = clientDate || getCurrentISTDateString()
    const { data: exemptions } = await adminClient
      .from('work_allocations')
      .select('site_id')
      .eq('allocation_date', today)
      .eq('work_allocated', false)

    const exemptedIds = new Set(exemptions?.map(e => e.site_id) || [])

    return sites?.map(s => ({
      siteId: s.site_id,
      siteName: s.site_name,
      clientName: s.client_name,
      siteLocation: s.site_location,
      exemptedToday: exemptedIds.has(s.site_id)
    })) || []
    } catch (error) {
      console.error('getSupervisorSites failure')
      return []
    }
}

export async function getTodayHoliday() {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()
    const today = getCurrentISTDateString()
    const { data } = await adminClient
      .from('holidays')
      .select('name, description')
      .eq('date', today)
      .maybeSingle()
    
    return data ? { isHoliday: true, name: data.name, description: data.description } : { isHoliday: false }
  } catch (error) {
    return { isHoliday: false }
  }
}

export async function getPendingDates(siteId: number, clientDate?: string) {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()

    // 1. Get site creation date
    const { data: site } = await adminClient
      .from('sites')
      .select('created_at')
      .eq('site_id', siteId)
      .single()
    
    if (!site) return []
    const siteCreationDate = site.created_at ? new Date(site.created_at) : new Date()
    siteCreationDate.setHours(0, 0, 0, 0)

    // 2. Generate potential dates (up to last 30 days)
    const dates = []
    let refDate: Date;
    
    if (clientDate) {
      const [y, m, d] = clientDate.split('-').map(Number);
      refDate = new Date(y, m - 1, d);
    } else {
      const istStr = getCurrentISTDateString();
      const [y, m, d] = istStr.split('-').map(Number);
      refDate = new Date(y, m - 1, d);
    }
    refDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const d = new Date(refDate)
      d.setDate(d.getDate() - i)
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (d < siteCreationDate) break;
      dates.push(dateStr)
    }

    // 3. Get existing reports
    const { data: existing } = await adminClient
      .from('daily_reports')
      .select('report_date')
      .eq('site_id', siteId)
      .in('report_date', dates)
      .eq('deleted', false)

    const existingDates = new Set(existing?.map(e => e.report_date) || [])

    // 4. Get holidays & exemptions
    const { data: holidays } = await adminClient
      .from('holidays')
      .select('date')
      .in('date', dates)
    
    const { data: allocations } = await adminClient
      .from('work_allocations')
      .select('allocation_date, remarks')
      .eq('site_id', siteId)
      .in('allocation_date', dates)
      .eq('work_allocated', false)

    const holidayDates = new Set(holidays?.map(h => h.date) || [])
    const adminExemptions = new Set(allocations?.filter(a => a.remarks !== 'Supervisor Skip').map(a => a.allocation_date) || [])
    const supervisorSkips = new Set(allocations?.filter(a => a.remarks === 'Supervisor Skip').map(a => a.allocation_date) || [])

    return dates.filter(d => {
      if (existingDates.has(d)) return false;

      // Check if it's a Sunday
      const [y, m, day] = d.split('-').map(Number);
      const dateObj = new Date(y, m - 1, day);
      if (dateObj.getDay() === 0) return false;

      if (holidayDates.has(d)) return false;
      if (adminExemptions.has(d)) return false;
      if (supervisorSkips.has(d)) return false;
      return true;
    });
    } catch (error) {
      console.error('getPendingDates failure')
      return []
    }
}

export async function skipDate(siteId: number, date: string) {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('work_allocations')
      .insert({
        site_id: siteId,
        allocation_date: date,
        work_allocated: false,
        remarks: 'Supervisor Skip'
      })

    if (error) return { error: error.message }
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to skip date' }
  }
}

export async function revokeSkipDate(siteId: number, date: string) {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('work_allocations')
      .delete()
      .eq('site_id', siteId)
      .eq('allocation_date', date)
      .eq('remarks', 'Supervisor Skip')

    if (error) return { error: error.message }
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to revoke skip' }
  }
}

export async function submitDailyReport(payload: any) {
  try {
    const user = await verifyAuth()
    const adminClient = createAdminClient()

    const username = user.email?.split('@')[0]
    const { data: profile } = await adminClient
      .from('users')
      .select('id')
      .ilike('username', username || '')
      .single()

    if (!profile) return { error: 'Profile not found' }

    const reportDate = payload.reportDate || getCurrentISTDateString()

    const { data: exemption } = await adminClient
      .from('work_allocations')
      .select('id')
      .eq('site_id', payload.siteId)
      .eq('allocation_date', reportDate)
      .eq('work_allocated', false)
      .maybeSingle()

    if (exemption) {
      return { error: 'This site is exempted for this date. No reports can be filed.' }
    }

    const { data: existingReport } = await adminClient
      .from('daily_reports')
      .select('report_id')
      .eq('site_id', payload.siteId)
      .eq('report_date', reportDate)
      .eq('deleted', false)
      .maybeSingle()

    if (existingReport) {
      return { error: 'A report already exists for this site and date.' }
    }

    const { data: report, error: reportError } = await adminClient
      .from('daily_reports')
      .insert({
        site_id: payload.siteId,
        supervisor_id: profile.id,
        report_date: reportDate,
        work_progress: payload.workProgress,
        remarks: payload.remarks
      })
      .select()
      .single()

    if (reportError) return { error: reportError.message }

    const reportId = report.report_id
    const childPromises = []

    if (payload.labourEntries?.length) {
      childPromises.push(adminClient.from('labour_entries').insert(
        payload.labourEntries.map((le: any) => ({ report_id: reportId, ...le }))
      ))
    }

    if (payload.materialInwards?.length) {
      childPromises.push(adminClient.from('material_inward_entries').insert(
        payload.materialInwards.map((mi: any) => ({ report_id: reportId, ...mi }))
      ))
    }

    if (payload.labourAdvances?.length) {
      childPromises.push(adminClient.from('labour_advance_entries').insert(
        payload.labourAdvances.map((la: any) => ({ report_id: reportId, ...la }))
      ))
    }

    if (payload.materialExpenses?.length) {
      childPromises.push(adminClient.from('material_expense_entries').insert(
        payload.materialExpenses.map((me: any) => ({ report_id: reportId, ...me }))
      ))
    }

    if (payload.remainingStocks?.length) {
      childPromises.push(adminClient.from('remaining_stock_entries').insert(
        payload.remainingStocks.map((rs: any) => ({ report_id: reportId, ...rs }))
      ))
    }

    const results = await Promise.all(childPromises)
    const firstError = results.find(r => r.error)
    if (firstError) return { error: firstError.error?.message || 'Unknown error' }

    const { data: site } = await adminClient.from('sites').select('site_name').eq('site_id', payload.siteId).single()
    const { data: profile_name } = await adminClient.from('users').select('full_name').eq('id', profile.id).single()
    
    await adminClient.from('notifications').insert({
      type: 'success',
      title: 'New Report Submitted',
      description: `Supervisor ${profile_name?.full_name || username} has submitted a new report for ${site?.site_name || 'site'} on ${reportDate}`,
      site: site?.site_name
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Transaction failed' }
  }
}

export async function getMyReports() {
  try {
    const user = await verifyAuth()

    const username = user.email?.split('@')[0]
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('users')
      .select('id')
      .ilike('username', username || '')
      .single()

    if (!profile) return []

    const { data } = await adminClient
      .from('daily_reports')
      .select(`
        *,
        site:sites(site_name),
        labour_entries(count),
        material_inward_entries(quantity),
        material_expense_entries(amount),
        labour_advance_entries(amount)
      `)
      .eq('supervisor_id', profile.id)
      .eq('deleted', false)
      .order('report_date', { ascending: false })

    return data?.map(r => ({
      reportId: r.report_id,
      reportDate: r.report_date,
      workProgress: r.work_progress,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      site: { siteName: r.site?.site_name },
      labourEntries: r.labour_entries,
      materialInwards: r.material_inward_entries,
      materialExpenses: r.material_expense_entries,
      labourAdvances: r.labour_advance_entries
    })) || []
  } catch (error) {
    return []
  }
}

export async function getReportDetails(id: number) {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
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

    return {
      reportId: data.report_id,
      reportDate: data.report_date,
      createdAt: data.created_at,
      workProgress: data.work_progress,
      remarks: data.remarks,
      site: { siteId: data.site_id, siteName: data.site?.site_name },
      supervisor: { fullName: data.supervisor?.full_name },
      photos: data.photos || [],
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
  } catch (error) {
    return null
  }
}

export async function updateDailyReport(id: number, payload: any) {
  try {
    await verifyAuth()
    const adminClient = createAdminClient()

    const { data: report } = await adminClient
      .from('daily_reports')
      .select('report_date, created_at, supervisor_id')
      .eq('report_id', id)
      .single()

    if (!report) return { error: 'Report not found' }

    const reportDateStr = report.report_date
    const createdAt = new Date(report.created_at)
    const now = new Date()

    // Normalize for date comparison
    const reportDate = new Date(reportDateStr + 'T00:00:00')
    const createdDateOnly = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
    
    let freezeAt: Date
    if (createdDateOnly.getTime() === reportDate.getTime()) {
      // Case 1: On-time -> Frozen at midnight of creation day
      freezeAt = new Date(createdDateOnly.getTime() + 24 * 60 * 60 * 1000)
    } else {
      // Case 2: Delayed -> Frozen 4 hours after creation
      freezeAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000)
    }

    if (now.getTime() > freezeAt.getTime()) {
      return { error: 'Modification window expired. This report is now permanently sealed.' }
    }

    const { error: reportError } = await adminClient
      .from('daily_reports')
      .update({
        site_id: payload.siteId,
        work_progress: payload.workProgress,
        remarks: payload.remarks
      })
      .eq('report_id', id)

    if (reportError) return { error: reportError.message }

    await Promise.all([
      adminClient.from('labour_entries').delete().eq('report_id', id),
      adminClient.from('material_inward_entries').delete().eq('report_id', id),
      adminClient.from('labour_advance_entries').delete().eq('report_id', id),
      adminClient.from('material_expense_entries').delete().eq('report_id', id),
      adminClient.from('remaining_stock_entries').delete().eq('report_id', id)
    ])

    const childPromises = []
    if (payload.labourEntries?.length) {
      childPromises.push(adminClient.from('labour_entries').insert(
        payload.labourEntries.map((le: any) => ({ report_id: id, ...le }))
      ))
    }
    if (payload.materialInwards?.length) {
      childPromises.push(adminClient.from('material_inward_entries').insert(
        payload.materialInwards.map((mi: any) => ({ report_id: id, ...mi }))
      ))
    }
    if (payload.labourAdvances?.length) {
      childPromises.push(adminClient.from('labour_advance_entries').insert(
        payload.labourAdvances.map((la: any) => ({ report_id: id, ...la }))
      ))
    }
    if (payload.materialExpenses?.length) {
      childPromises.push(adminClient.from('material_expense_entries').insert(
        payload.materialExpenses.map((me: any) => ({ report_id: id, ...me }))
      ))
    }
    if (payload.remainingStocks?.length) {
      childPromises.push(adminClient.from('remaining_stock_entries').insert(
        payload.remainingStocks.map((rs: any) => ({ report_id: id, ...rs }))
      ))
    }

    const results = await Promise.all(childPromises)
    const firstError = results.find(r => r.error)
    if (firstError) return { error: firstError.error?.message || 'Unknown error' }

    const { data: siteObj } = await adminClient.from('sites').select('site_name').eq('site_id', payload.siteId).single()
    await adminClient.from('notifications').insert({
      type: 'info',
      title: 'Report Updated',
      description: `Supervisor has updated the report for ${siteObj?.site_name || 'site'}`,
      site: siteObj?.site_name
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update report' }
  }
}

export async function getSupervisorReportCount(supervisorId: number) {
  await verifyAuth()
  const adminClient = createAdminClient()
  const { count } = await adminClient
    .from('daily_reports')
    .select('*', { count: 'exact', head: true })
    .eq('supervisor_id', supervisorId)
    .eq('deleted', false)
  
  return count || 0
}