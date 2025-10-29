'use client'

import { Line } from 'recharts'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type SalesData = {
  month: string
  sales: number
  profit: number
  target: number
}

export function SalesChart({ data }: { data: SalesData[] }) {
  const formattedData = data.map(item => ({
    ...item,
    month: format(new Date(item.month), 'M月', { locale: ja })
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => `¥${value.toLocaleString()}`}
            labelStyle={{ color: '#000' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#2563eb" 
            name="売上実績" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#16a34a" 
            name="利益実績" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#dc2626" 
            name="売上目標" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
