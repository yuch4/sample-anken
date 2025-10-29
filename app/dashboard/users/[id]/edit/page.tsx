import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { UserForm } from '@/components/users/user-form'
import { notFound } from 'next/navigation'

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 権限チェック
  const { data: { user: currentAuthUser } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', currentAuthUser?.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">アクセス拒否</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">この機能は管理者のみ利用できます。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 編集対象ユーザーを取得
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">ユーザー編集</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
