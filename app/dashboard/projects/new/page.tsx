import { createClient } from '@/lib/supabase/server'
import ProjectForm from '../project-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewProjectPage() {
  const supabase = await createClient()

  // Get all users for assignment dropdown
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .order('name')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新規案件登録</h1>
        <p className="text-sm text-gray-600 mt-1">
          案件の情報を入力してください
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>案件情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
