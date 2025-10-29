'use client'

import { useState } from 'react'
import { createOrUpdateTarget } from '@/app/actions/targets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

export default function TargetForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await createOrUpdateTarget(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('目標を設定しました')
      // Reset form
      const form = document.getElementById('target-form') as HTMLFormElement
      form?.reset()
    }
    
    setLoading(false)
  }

  return (
    <form id="target-form" action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="target_month">対象月 *</Label>
        <Input
          id="target_month"
          name="target_month"
          type="month"
          defaultValue={format(new Date(), 'yyyy-MM')}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sales_target">売上目標 *</Label>
        <Input
          id="sales_target"
          name="sales_target"
          type="number"
          step="0.01"
          placeholder="15000000"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profit_target">粗利目標 *</Label>
        <Input
          id="profit_target"
          name="profit_target"
          type="number"
          step="0.01"
          placeholder="4500000"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '設定中...' : '目標を設定'}
      </Button>
    </form>
  )
}
