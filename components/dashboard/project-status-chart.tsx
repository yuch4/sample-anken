'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type StatusData = {
  status: string
  count: number
  amount: number
}

export function ProjectStatusChart({ data }: { data: StatusData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
          <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === '件数') return `${value}件`
              return `¥${value.toLocaleString()}`
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="count" fill="#2563eb" name="件数" />
          <Bar yAxisId="right" dataKey="amount" fill="#16a34a" name="金額" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
