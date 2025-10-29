import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type Project = {
  id: string
  name: string
  customer_name: string
  category: string
  status: string
  sales_amount: number
  gross_profit: number
  probability: number
  expected_order_month: string | null
  expected_booking_month: string | null
  assigned_user?: { name: string }
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, string> = {
  lead: 'リード',
  negotiation: '商談中',
  proposal: '提案中',
  won: '受注',
  lost: '失注'
}

export function exportProjectsToExcel(projects: any[]) {
  // データを整形
  const data = projects.map(project => ({
    '案件名': project.name,
    '顧客名': project.customer_name,
    'カテゴリ': project.category,
    'ステータス': statusLabels[project.status] || project.status,
    '売上金額': project.sales_amount,
    '粗利': project.gross_profit,
    '確度': `${project.probability}%`,
    '受注予定月': project.expected_order_month ? format(new Date(project.expected_order_month), 'yyyy年M月', { locale: ja }) : '',
    '売上計上月': project.expected_booking_month ? format(new Date(project.expected_booking_month), 'yyyy年M月', { locale: ja }) : '',
    '担当者': project.assigned_user?.name || '',
    '作成日': format(new Date(project.created_at), 'yyyy/MM/dd', { locale: ja }),
    '更新日': format(new Date(project.updated_at), 'yyyy/MM/dd', { locale: ja })
  }))

  // ワークブックを作成
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '案件一覧')

  // 列幅を調整
  const colWidths = [
    { wch: 30 }, // 案件名
    { wch: 20 }, // 顧客名
    { wch: 15 }, // カテゴリ
    { wch: 10 }, // ステータス
    { wch: 15 }, // 売上金額
    { wch: 15 }, // 粗利
    { wch: 8 },  // 確度
    { wch: 12 }, // 受注予定月
    { wch: 12 }, // 売上計上月
    { wch: 15 }, // 担当者
    { wch: 12 }, // 作成日
    { wch: 12 }  // 更新日
  ]
  ws['!cols'] = colWidths

  // ファイルを生成してダウンロード
  const fileName = `案件一覧_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

export function exportProjectsToCSV(projects: any[]) {
  // データを整形
  const data = projects.map(project => ({
    '案件名': project.name,
    '顧客名': project.customer_name,
    'カテゴリ': project.category,
    'ステータス': statusLabels[project.status] || project.status,
    '売上金額': project.sales_amount,
    '粗利': project.gross_profit,
    '確度': `${project.probability}%`,
    '受注予定月': project.expected_order_month ? format(new Date(project.expected_order_month), 'yyyy年M月', { locale: ja }) : '',
    '売上計上月': project.expected_booking_month ? format(new Date(project.expected_booking_month), 'yyyy年M月', { locale: ja }) : '',
    '担当者': project.assigned_user?.name || '',
    '作成日': format(new Date(project.created_at), 'yyyy/MM/dd', { locale: ja }),
    '更新日': format(new Date(project.updated_at), 'yyyy/MM/dd', { locale: ja })
  }))

  // ワークシートを作成してCSVに変換
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)

  // BOMを追加してExcelで文字化けしないようにする
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  
  // ダウンロード
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `案件一覧_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
