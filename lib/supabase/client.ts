import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from '../mock-supabase'

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || 
                    process.env.USE_MOCK_DATA === 'true'

export function createClient() {
  // モックモードの場合
  if (useMockData) {
    return createMockClient() as any
  }

  // 本番モードの場合
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
