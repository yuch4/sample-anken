'use client'

import { useState } from 'react'
import { createProject, updateProject } from '@/app/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface ProjectFormProps {
  users: Array<{ id: string; name: string; email: string }>
  project?: {
    id: string
    company_name: string
    contact_person: string | null
    status: string
    sales_amount: number
    gross_profit: number
    probability: number
    category: string | null
    expected_order_month: string | null
    expected_booking_month: string | null
    assigned_user_id: string
  }
}

const statusOptions = [
  { value: 'lead', label: 'リード' },
  { value: 'negotiation', label: '商談' },
  { value: 'proposal', label: '提案' },
  { value: 'won', label: '受注' },
  { value: 'lost', label: '失注' },
]

const categoryOptions = [
  { value: '新規', label: '新規' },
  { value: '既存', label: '既存' },
  { value: 'アップセル', label: 'アップセル' },
  { value: 'クロスセル', label: 'クロスセル' },
]

export default function ProjectForm({ users, project }: ProjectFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(project?.status || 'lead')
  const [category, setCategory] = useState(project?.category || '')
  const [assignedUserId, setAssignedUserId] = useState(project?.assigned_user_id || '')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Add select field values to formData
    formData.set('status', status)
    if (category) formData.set('category', category)
    if (assignedUserId) formData.set('assigned_user_id', assignedUserId)

    const result = project
      ? await updateProject(project.id, formData)
      : await createProject(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">企業名 *</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={project?.company_name}
            placeholder="株式会社○○"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">担当者名</Label>
          <Input
            id="contact_person"
            name="contact_person"
            defaultValue={project?.contact_person || ''}
            placeholder="山田太郎"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">ステータス *</Label>
          <Select value={status} onValueChange={setStatus} disabled={loading}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select value={category} onValueChange={setCategory} disabled={loading}>
            <SelectTrigger id="category">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sales_amount">売上金額 *</Label>
          <Input
            id="sales_amount"
            name="sales_amount"
            type="number"
            step="0.01"
            defaultValue={project?.sales_amount}
            placeholder="1000000"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gross_profit">粗利金額 *</Label>
          <Input
            id="gross_profit"
            name="gross_profit"
            type="number"
            step="0.01"
            defaultValue={project?.gross_profit}
            placeholder="300000"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="probability">確度 (%) *</Label>
        <Input
          id="probability"
          name="probability"
          type="number"
          min="0"
          max="100"
          defaultValue={project?.probability || 0}
          placeholder="50"
          required
          disabled={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expected_order_month">受注予定月</Label>
          <Input
            id="expected_order_month"
            name="expected_order_month"
            type="month"
            defaultValue={project?.expected_order_month || ''}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_booking_month">計上予定月</Label>
          <Input
            id="expected_booking_month"
            name="expected_booking_month"
            type="month"
            defaultValue={project?.expected_booking_month || ''}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_user_id">担当者 *</Label>
        <Select
          value={assignedUserId}
          onValueChange={setAssignedUserId}
          disabled={loading}
          required
        >
          <SelectTrigger id="assigned_user_id">
            <SelectValue placeholder="担当者を選択" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : project ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  )
}
