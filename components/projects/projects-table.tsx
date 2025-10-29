'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ProjectsFilter } from './projects-filter'

const statusLabels = {
  lead: { label: 'リード', color: 'bg-gray-500' },
  negotiation: { label: '商談', color: 'bg-blue-500' },
  proposal: { label: '提案', color: 'bg-yellow-500' },
  won: { label: '受注', color: 'bg-green-500' },
  lost: { label: '失注', color: 'bg-red-500' },
}

type FilterState = {
  search: string
  status: string
  category: string
  assignedUserId: string
}

export function ProjectsTable({ projects }: { projects: any[] }) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    category: 'all',
    assignedUserId: 'all'
  })

  // カテゴリと担当者のユニークなリストを作成
  const categories = useMemo(() => {
    const uniqueCategories = new Set(projects.map(p => p.category).filter(Boolean))
    return Array.from(uniqueCategories)
  }, [projects])

  const users = useMemo(() => {
    const uniqueUsers = new Map()
    projects.forEach(p => {
      if (p.assigned_user_id && p.assigned_user) {
        uniqueUsers.set(p.assigned_user_id, {
          id: p.assigned_user_id,
          name: (p.assigned_user as any)?.name || '不明'
        })
      }
    })
    return Array.from(uniqueUsers.values())
  }, [projects])

  // フィルタリングされた案件
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // キーワード検索
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchName = project.name?.toLowerCase().includes(searchLower)
        const matchCustomer = project.customer_name?.toLowerCase().includes(searchLower)
        if (!matchName && !matchCustomer) return false
      }

      // ステータス
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false
      }

      // カテゴリ
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false
      }

      // 担当者
      if (filters.assignedUserId !== 'all' && project.assigned_user_id !== filters.assignedUserId) {
        return false
      }

      return true
    })
  }, [projects, filters])

  return (
    <>
      <ProjectsFilter
        onFilterChange={setFilters}
        categories={categories}
        users={users}
      />

      <div className="text-sm text-gray-600 mt-4">
        {filteredProjects.length}件の案件を表示（全{projects.length}件）
      </div>

      {filteredProjects.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left font-medium">案件名</th>
                <th className="pb-3 text-left font-medium">顧客名</th>
                <th className="pb-3 text-left font-medium">カテゴリ</th>
                <th className="pb-3 text-left font-medium">ステータス</th>
                <th className="pb-3 text-right font-medium">売上</th>
                <th className="pb-3 text-right font-medium">確度</th>
                <th className="pb-3 text-left font-medium">受注予定月</th>
                <th className="pb-3 text-left font-medium">担当</th>
                <th className="pb-3 text-left font-medium">更新日</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const statusInfo = statusLabels[project.status as keyof typeof statusLabels]
                return (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-3">{project.customer_name || '-'}</td>
                    <td className="py-3">{project.category || '-'}</td>
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
        <div className="py-8 text-center text-gray-500 mt-4">
          <p>条件に一致する案件が見つかりません</p>
        </div>
      )}
    </>
  )
}
