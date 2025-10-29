import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { ExportButton } from '@/components/projects/export-button'
import { ProjectsTable } from '@/components/projects/projects-table'

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
        <div className="flex gap-2">
          {projects && projects.length > 0 && (
            <ExportButton projects={projects} />
          )}
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              新規案件登録
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>案件リスト</CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <ProjectsTable projects={projects} />
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
