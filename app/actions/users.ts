'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string

  // Supabase Authでユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    return { error: authError.message }
  }

  // public.usersテーブルにレコードを作成
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      name,
      role
    })

  if (dbError) {
    // Auth ユーザーは作成されたが、DB レコード作成に失敗した場合
    // TODO: Auth ユーザーも削除するロールバック処理が望ましい
    return { error: dbError.message }
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function updateUser(userId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const role = formData.get('role') as string

  const { error } = await supabase
    .from('users')
    .update({ name, role })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // public.usersテーブルからレコードを削除
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (dbError) {
    return { error: dbError.message }
  }

  // Auth ユーザーも削除
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    // DB レコードは削除されたが、Auth ユーザー削除に失敗
    console.error('Auth user deletion failed:', authError)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
