import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TargetForm from './target-form'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function TargetsPage() {
  const supabase = await createClient()

  const { data: targets } = await supabase
    .from('monthly_targets')
    .select('*')
    .is('user_id', null)
    .order('target_month', { ascending: false })
    .limit(12)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">目標設定</h1>
        <p className="text-sm text-gray-600 mt-1">
          月次の売上・粗利目標を設定できます
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>月次目標を設定</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>設定済み目標</CardTitle>
          </CardHeader>
          <CardContent>
            {targets && targets.length > 0 ? (
              <div className="space-y-3">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(target.target_month), 'yyyy年M月')}
                      </p>
                      <p className="text-sm text-gray-500">
                        売上: ¥{Number(target.sales_target).toLocaleString()} / 
                        粗利: ¥{Number(target.profit_target).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                設定済みの目標がありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
