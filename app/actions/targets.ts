'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrUpdateTarget(formData: FormData) {
  const supabase = await createClient()

  const targetMonth = formData.get('target_month') as string
  const salesTarget = parseFloat(formData.get('sales_target') as string)
  const profitTarget = parseFloat(formData.get('profit_target') as string)

  // Check if target already exists for this month
  const { data: existing } = await supabase
    .from('monthly_targets')
    .select('id')
    .eq('target_month', targetMonth + '-01')
    .is('user_id', null)
    .single()

  if (existing) {
    // Update existing target
    const { error } = await supabase
      .from('monthly_targets')
      .update({
        sales_target: salesTarget,
        profit_target: profitTarget,
      })
      .eq('id', existing.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Create new target
    const { error } = await supabase.from('monthly_targets').insert({
      target_month: targetMonth + '-01',
      sales_target: salesTarget,
      profit_target: profitTarget,
      user_id: null,
    })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard/targets')
  revalidatePath('/dashboard')
  return { success: true }
}
