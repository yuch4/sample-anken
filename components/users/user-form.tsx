'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser, updateUser } from '@/app/actions/users'

type UserFormProps = {
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function UserForm({ user }: UserFormProps) {
  const [role, setRole] = useState(user?.role || 'sales')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    formData.set('role', role)

    let result
    if (user) {
      result = await updateUser(user.id, formData)
    } else {
      result = await createUser(formData)
    }

    if (result?.error) {
      alert(`エラー: ${result.error}`)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">名前 *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user?.name}
          required
          placeholder="山田 太郎"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email}
          required
          disabled={!!user}
          placeholder="yamada@example.com"
        />
        {user && (
          <p className="text-xs text-gray-500">
            メールアドレスは編集できません
          </p>
        )}
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">パスワード *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="8文字以上"
          />
          <p className="text-xs text-gray-500">
            8文字以上のパスワードを設定してください
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">役割 *</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">営業</SelectItem>
            <SelectItem value="manager">マネージャー</SelectItem>
            <SelectItem value="admin">管理者</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : user ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}
