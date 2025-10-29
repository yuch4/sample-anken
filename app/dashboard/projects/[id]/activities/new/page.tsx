'use client'

import { useState } from 'react'
import { createActivity } from '@/app/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'

const activityTypeOptions = [
  { value: 'visit', label: '訪問' },
  { value: 'call', label: '電話' },
  { value: 'email', label: 'メール' },
  { value: 'meeting', label: '商談' },
]

export default function NewActivityPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activityType, setActivityType] = useState('visit')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('activity_type', activityType)

    const result = await createActivity(projectId, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/dashboard/projects/${projectId}`)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">活動履歴を追加</h1>
        <p className="text-sm text-gray-600 mt-1">
          案件の活動内容を記録してください
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活動情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="activity_type">活動種別 *</Label>
              <Select value={activityType} onValueChange={setActivityType} disabled={loading}>
                <SelectTrigger id="activity_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_date">活動日時 *</Label>
              <Input
                id="activity_date"
                name="activity_date"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">活動内容 *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="活動の詳細を記録してください"
                rows={6}
                required
                disabled={loading}
              />
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
                {loading ? '登録中...' : '登録'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
