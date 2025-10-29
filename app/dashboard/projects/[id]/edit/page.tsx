import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectForm from '../../project-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!project) {
    notFound()
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .order('name')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">案件編集</h1>
        <p className="text-sm text-gray-600 mt-1">
          {project.company_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>案件情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm users={users || []} project={project} />
        </CardContent>
      </Card>
    </div>
  )
}
