import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

const statusLabels = {
  lead: { label: 'リード', color: 'bg-gray-500' },
  negotiation: { label: '商談', color: 'bg-blue-500' },
  proposal: { label: '提案', color: 'bg-yellow-500' },
  won: { label: '受注', color: 'bg-green-500' },
  lost: { label: '失注', color: 'bg-red-500' },
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, assigned_user:users(name)')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件一覧</h1>
          <p className="text-sm text-gray-600 mt-1">
            全{projects?.length || 0}件の案件
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            新規案件登録
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>案件リスト</CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">企業名</th>
                    <th className="pb-3 text-left font-medium">担当者</th>
                    <th className="pb-3 text-left font-medium">ステータス</th>
                    <th className="pb-3 text-right font-medium">売上</th>
                    <th className="pb-3 text-right font-medium">確度</th>
                    <th className="pb-3 text-left font-medium">受注予定月</th>
                    <th className="pb-3 text-left font-medium">担当</th>
                    <th className="pb-3 text-left font-medium">更新日</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const statusInfo = statusLabels[project.status as keyof typeof statusLabels]
                    return (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {project.company_name}
                          </Link>
                        </td>
                        <td className="py-3">{project.contact_person || '-'}</td>
                        <td className="py-3">
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          ¥{Number(project.sales_amount).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">{project.probability}%</td>
                        <td className="py-3">
                          {project.expected_order_month
                            ? format(new Date(project.expected_order_month), 'yyyy-MM')
                            : '-'}
                        </td>
                        <td className="py-3">
                          {(project.assigned_user as any)?.name || '-'}
                        </td>
                        <td className="py-3">
                          {format(new Date(project.updated_at), 'yyyy-MM-dd')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>案件が登録されていません</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  最初の案件を登録
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
