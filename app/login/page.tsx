import { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'ログイン - 営業案件管理システム',
  description: 'ログインしてシステムにアクセス',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            営業案件管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログイン
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
