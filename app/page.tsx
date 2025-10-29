import { redirect } from 'next/navigation'

export default function Home() {
  // モックモードの場合はダッシュボードへ、それ以外はログインへ
  const useMockData = process.env.USE_MOCK_DATA === 'true'
  redirect(useMockData ? '/dashboard' : '/login')
}
