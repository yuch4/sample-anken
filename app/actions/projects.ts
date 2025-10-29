'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  const data = {
    company_name: formData.get('company_name') as string,
    contact_person: formData.get('contact_person') as string || null,
    status: formData.get('status') as string,
    sales_amount: parseFloat(formData.get('sales_amount') as string),
    gross_profit: parseFloat(formData.get('gross_profit') as string),
    probability: parseInt(formData.get('probability') as string),
    category: formData.get('category') as string || null,
    expected_order_month: formData.get('expected_order_month') as string || null,
    expected_booking_month: formData.get('expected_booking_month') as string || null,
    assigned_user_id: formData.get('assigned_user_id') as string || user.id,
  }

  const { error } = await supabase.from('projects').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    company_name: formData.get('company_name') as string,
    contact_person: formData.get('contact_person') as string || null,
    status: formData.get('status') as string,
    sales_amount: parseFloat(formData.get('sales_amount') as string),
    gross_profit: parseFloat(formData.get('gross_profit') as string),
    probability: parseInt(formData.get('probability') as string),
    category: formData.get('category') as string || null,
    expected_order_month: formData.get('expected_order_month') as string || null,
    expected_booking_month: formData.get('expected_booking_month') as string || null,
    assigned_user_id: formData.get('assigned_user_id') as string,
  }

  const { error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${projectId}`)
  redirect(`/dashboard/projects/${projectId}`)
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}

export async function createActivity(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  const data = {
    project_id: projectId,
    user_id: user.id,
    activity_type: formData.get('activity_type') as string,
    content: formData.get('content') as string,
    activity_date: formData.get('activity_date') as string,
  }

  const { error } = await supabase.from('activities').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function deleteActivity(activityId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}
