import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { ProjectStatusChart } from '@/components/dashboard/project-status-chart'

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
  const userStats = allProjects?.reduce((acc: any[], project: any) => {
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

  // 過去6ヶ月の月次データを取得
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const targetDate = subMonths(now, i)
    const targetMonth = format(targetDate, 'yyyy-MM-01')
    
    // その月の目標を取得
    const monthTarget = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('target_month', targetMonth)
      .is('user_id', null)
      .single()
    
    // その月の受注案件を取得
    const monthProjects = allProjects?.filter((p: any) => 
      p.status === 'won' && 
      p.expected_booking_month?.startsWith(targetMonth)
    ) || []
    
    const monthSales = monthProjects.reduce((sum: number, p: any) => sum + Number(p.sales_amount), 0)
    const monthProfit = monthProjects.reduce((sum: number, p: any) => sum + Number(p.gross_profit), 0)
    
    monthlyData.push({
      month: targetMonth,
      sales: monthSales,
      profit: monthProfit,
      target: Number(monthTarget.data?.sales_target || 0)
    })
  }

  // カテゴリ別集計（受注案件のみ）
  const categoryData = allProjects
    ?.filter((p: any) => p.status === 'won')
    .reduce((acc: any[], project: any) => {
      const category = project.category || '未分類'
      const existing = acc.find(c => c.name === category)
      if (existing) {
        existing.value += Number(project.sales_amount)
      } else {
        acc.push({
          name: category,
          value: Number(project.sales_amount)
        })
      }
      return acc
    }, []) || []

  // ステータス別集計（件数と金額）
  const statusChartData = [
    { status: 'リード', count: allProjects?.filter((p: any) => p.status === 'lead').length || 0, amount: allProjects?.filter((p: any) => p.status === 'lead').reduce((sum: number, p: any) => sum + Number(p.sales_amount), 0) || 0 },
    { status: '商談中', count: statusCount.negotiation, amount: allProjects?.filter((p: any) => p.status === 'negotiation').reduce((sum: number, p: any) => sum + Number(p.sales_amount), 0) || 0 },
    { status: '提案中', count: statusCount.proposal, amount: allProjects?.filter((p: any) => p.status === 'proposal').reduce((sum: number, p: any) => sum + Number(p.sales_amount), 0) || 0 },
    { status: '受注', count: statusCount.won, amount: salesActual },
    { status: '失注', count: statusCount.lost, amount: 0 },
  ]

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
                  {userStats.map((user: any) => (
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

      {/* グラフエリア */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>月次売上推移</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別売上</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <CategoryChart data={categoryData} />
            ) : (
              <p className="text-sm text-gray-500">データがありません</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ステータス別案件分析</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectStatusChart data={statusChartData} />
        </CardContent>
      </Card>
    </div>
  )
}
