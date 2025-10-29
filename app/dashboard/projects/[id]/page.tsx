import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import DeleteProjectButton from './delete-project-button'
import ActivityList from './activity-list'

export const dynamic = 'force-dynamic'

const statusLabels = {
  lead: { label: 'リード', color: 'bg-gray-500' },
  negotiation: { label: '商談', color: 'bg-blue-500' },
  proposal: { label: '提案', color: 'bg-yellow-500' },
  won: { label: '受注', color: 'bg-green-500' },
  lost: { label: '失注', color: 'bg-red-500' },
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, assigned_user:users(name, email)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!project) {
    notFound()
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('*, user:users(name)')
    .eq('project_id', id)
    .order('activity_date', { ascending: false })

  const statusInfo = statusLabels[project.status as keyof typeof statusLabels]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.company_name}</h1>
          <p className="text-sm text-gray-600 mt-1">案件詳細</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
          <DeleteProjectButton projectId={id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">企業名</p>
              <p className="mt-1 text-base">{project.company_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">担当者</p>
              <p className="mt-1 text-base">{project.contact_person || '-'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">ステータス</p>
              <div className="mt-1">
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">カテゴリ</p>
              <p className="mt-1 text-base">{project.category || '-'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500">売上金額</p>
              <p className="mt-1 text-lg font-semibold">
                ¥{Number(project.sales_amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">粗利金額</p>
              <p className="mt-1 text-lg font-semibold">
                ¥{Number(project.gross_profit).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">確度</p>
              <p className="mt-1 text-lg font-semibold">{project.probability}%</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">受注予定月</p>
              <p className="mt-1 text-base">
                {project.expected_order_month
                  ? format(new Date(project.expected_order_month), 'yyyy年M月')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">計上予定月</p>
              <p className="mt-1 text-base">
                {project.expected_booking_month
                  ? format(new Date(project.expected_booking_month), 'yyyy年M月')
                  : '-'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">担当者</p>
            <p className="mt-1 text-base">
              {(project.assigned_user as any)?.name || (project.assigned_user as any)?.email || '-'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">作成日</p>
              <p className="mt-1 text-base">
                {format(new Date(project.created_at), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">更新日</p>
              <p className="mt-1 text-base">
                {format(new Date(project.updated_at), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>活動履歴</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/dashboard/projects/${id}/activities/new`}>
              <Plus className="mr-2 h-4 w-4" />
              活動を追加
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ActivityList activities={activities || []} projectId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
