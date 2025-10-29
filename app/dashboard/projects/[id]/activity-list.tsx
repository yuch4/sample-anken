'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, Users, MapPin } from 'lucide-react'

interface Activity {
  id: string
  activity_type: string
  content: string
  activity_date: string
  user: { name: string } | null
}

const activityTypeLabels = {
  visit: { label: '訪問', icon: MapPin, color: 'bg-blue-500' },
  call: { label: '電話', icon: Phone, color: 'bg-green-500' },
  email: { label: 'メール', icon: Mail, color: 'bg-purple-500' },
  meeting: { label: '商談', icon: Users, color: 'bg-orange-500' },
}

export default function ActivityList({
  activities,
  projectId,
}: {
  activities: Activity[]
  projectId: string
}) {
  if (activities.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">
        活動履歴がありません
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const typeInfo = activityTypeLabels[activity.activity_type as keyof typeof activityTypeLabels]
        const Icon = typeInfo?.icon || Users

        return (
          <div key={activity.id} className="flex gap-4 border-l-2 border-gray-200 pl-4 pb-4">
            <div className="flex-shrink-0">
              <div className={`rounded-full p-2 ${typeInfo?.color || 'bg-gray-500'}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={typeInfo?.color || 'bg-gray-500'}>
                  {typeInfo?.label || activity.activity_type}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(new Date(activity.activity_date), 'yyyy-MM-dd HH:mm')}
                </span>
                <span className="text-sm text-gray-500">
                  | {activity.user?.name || '不明'}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
