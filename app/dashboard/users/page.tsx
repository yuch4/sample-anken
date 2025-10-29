import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { DeleteUserButton } from '@/components/users/delete-user-button'

export const dynamic = 'force-dynamic'

const roleLabels = {
  admin: { label: '管理者', color: 'bg-red-500' },
  manager: { label: 'マネージャー', color: 'bg-blue-500' },
  sales: { label: '営業', color: 'bg-green-500' },
}

export default async function UsersPage() {
  const supabase = await createClient()

  // 現在のユーザーを取得して権限チェック
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  // 管理者のみアクセス可能
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

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            全{users?.length || 0}名のユーザー
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <Plus className="mr-2 h-4 w-4" />
            新規ユーザー追加
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">名前</th>
                    <th className="pb-3 text-left font-medium">メールアドレス</th>
                    <th className="pb-3 text-left font-medium">役割</th>
                    <th className="pb-3 text-left font-medium">登録日</th>
                    <th className="pb-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => {
                    const roleInfo = roleLabels[user.role as keyof typeof roleLabels]
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{user.name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          <Badge className={roleInfo.color}>
                            {roleInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {format(new Date(user.created_at), 'yyyy-MM-dd')}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/users/${user.id}/edit`}>
                              編集
                            </Link>
                          </Button>
                          <DeleteUserButton userId={user.id} userName={user.name} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>ユーザーが登録されていません</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
