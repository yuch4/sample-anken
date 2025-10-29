import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 現在の月の開始日と終了日
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const currentMonth = format(now, 'yyyy-MM-01')

  // 今月の目標を取得
  const { data: targets } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('target_month', currentMonth)
    .is('user_id', null)
    .single()

  // 今月の受注済み案件（実績）を取得
  const { data: wonProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'won')
    .gte('expected_booking_month', monthStart)
    .lte('expected_booking_month', monthEnd)
    .is('deleted_at', null)

  // 全案件の統計
  const { data: allProjects } = await supabase
    .from('projects')
    .select('*, assigned_user:users(name)')
    .is('deleted_at', null)

  // 集計
  const salesActual = wonProjects?.reduce((sum, p) => sum + Number(p.sales_amount), 0) || 0
  const profitActual = wonProjects?.reduce((sum, p) => sum + Number(p.gross_profit), 0) || 0
  const salesTarget = Number(targets?.sales_target || 0)
  const profitTarget = Number(targets?.profit_target || 0)
  const salesAchievement = salesTarget > 0 ? (salesActual / salesTarget) * 100 : 0
  const profitAchievement = profitTarget > 0 ? (profitActual / profitTarget) * 100 : 0

  // ステータス別案件数
  const statusCount = {
    negotiation: allProjects?.filter(p => p.status === 'negotiation').length || 0,
    proposal: allProjects?.filter(p => p.status === 'proposal').length || 0,
    won: allProjects?.filter(p => p.status === 'won').length || 0,
    lost: allProjects?.filter(p => p.status === 'lost').length || 0,
  }

  // 売上予測（未受注案件の売上×確度）
  const salesForecast = allProjects
    ?.filter(p => p.status !== 'won' && p.status !== 'lost')
    .reduce((sum, p) => sum + (Number(p.sales_amount) * Number(p.probability) / 100), 0) || 0

  // 担当者別集計
  const userStats = allProjects?.reduce((acc: any[], project) => {
    const userId = project.assigned_user_id
    const userName = (project.assigned_user as any)?.name || '不明'
    
    if (project.status === 'won') {
      const existing = acc.find(u => u.userId === userId)
      if (existing) {
        existing.sales += Number(project.sales_amount)
        existing.profit += Number(project.gross_profit)
        existing.count += 1
      } else {
        acc.push({
          userId,
          userName,
          sales: Number(project.sales_amount),
          profit: Number(project.gross_profit),
          count: 1,
        })
      }
    }
    return acc
  }, []) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-600 mt-1">
          {format(now, 'yyyy年M月', { locale: ja })}の実績
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上実績</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{salesActual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              目標: ¥{salesTarget.toLocaleString()} ({salesAchievement.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">粗利実績</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{profitActual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              目標: ¥{profitTarget.toLocaleString()} ({profitAchievement.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">案件数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allProjects?.length || 0}件</div>
            <p className="text-xs text-muted-foreground">
              商談: {statusCount.negotiation} / 提案: {statusCount.proposal}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上予測</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{salesForecast.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              受注: {statusCount.won}件 / 失注: {statusCount.lost}件
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 担当者別実績 */}
      <Card>
        <CardHeader>
          <CardTitle>担当者別実績</CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">担当者</th>
                    <th className="pb-2 text-right font-medium">売上</th>
                    <th className="pb-2 text-right font-medium">粗利</th>
                    <th className="pb-2 text-right font-medium">案件数</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((user) => (
                    <tr key={user.userId} className="border-b">
                      <td className="py-2">{user.userName}</td>
                      <td className="py-2 text-right">¥{user.sales.toLocaleString()}</td>
                      <td className="py-2 text-right">¥{user.profit.toLocaleString()}</td>
                      <td className="py-2 text-right">{user.count}件</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">今月の受注実績がありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
