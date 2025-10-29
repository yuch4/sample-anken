かならず日本語で回答すること
回答の最初に必ず「💡」をつけること

# 動作確認
- playwright mcpとpuppeteer mcpを使って開発サーバを起動して実際の動作を確認すること
- 

# 営業案件管理システム - AI Coding Agent Instructions

## プロジェクト概要
営業チーム向けの案件・数字管理システム。Next.js 16 App Router + Supabase (PostgreSQL) で構築。20名規模の利用を想定。

## アーキテクチャの重要ポイント

### 1. Next.js Server Actions パターン
- **APIエンドポイント不要**: `app/actions/` 配下の Server Actions で全データ操作を実装
- **必須パターン**: 変更後は `revalidatePath()` でキャッシュ無効化 + `redirect()` でナビゲーション
  ```typescript
  // 例: app/actions/projects.ts
  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
  ```
- **エラーハンドリング**: `{ error: string }` 形式で返却、クライアント側で表示

### 2. Supabase クライアントの使い分け
- **Server Components**: `lib/supabase/server.ts` の `createClient()` を使用（`await` 必須）
- **Client Components**: `lib/supabase/client.ts` の `createClient()` を使用
- **重要**: Row Level Security (RLS) で権限制御済み。`assigned_user_id` など自動設定される

### 3. モックデータモード
- `USE_MOCK_DATA=true` で Supabase 不要で動作（開発・デモ用）
- `lib/mock-supabase.ts` が Supabase API を模倣
- 本番では環境変数を未設定にする

### 4. 認証フロー
- Supabase Auth + middleware でセッション管理
- `middleware.ts` が全ルートで認証チェック（`/login` 以外）
- `auth.users` と `public.users` の両方にレコード必要（RLS ポリシーが `public.users` 参照）

## データモデルの制約

### 論理削除パターン
- `projects` テーブルは `deleted_at` で論理削除（物理削除しない）
- クエリ時は `.is('deleted_at', null)` で除外必須

### ステータス遷移
- `projects.status`: `'lead' | 'negotiation' | 'proposal' | 'won' | 'lost'`
- **受注済み判定**: `status === 'won'` のみ売上実績にカウント

### 日付フォーマット
- `expected_order_month`, `expected_booking_month`: `'YYYY-MM-01'` 形式（月初日）
- **重要**: 日本語表示は `date-fns` + `ja` ロケールを使用
  ```typescript
  import { format } from 'date-fns'
  import { ja } from 'date-fns/locale'
  format(date, 'yyyy年M月', { locale: ja })
  ```

### RLS ポリシーの挙動
- 一般ユーザー: 全案件閲覧可、自分担当の案件のみ更新可
- マネージャー・管理者: 全案件更新可
- 目標設定: マネージャー・管理者のみ作成・更新可

## UI/UX 規約

### shadcn/ui コンポーネント
- `components/ui/` 配下は shadcn/ui 生成ファイル（手動編集禁止）
- 新規コンポーネント追加: `npx shadcn@latest add [component-name]`
- カスタムスタイルは Tailwind クラスで上書き

### フォームパターン
- **Server Actions 連携**: `<form action={serverAction}>` + `formData.get()`
- **Select コンポーネント**: 値を state で管理し、`formData.set()` で追加
  ```tsx
  // app/dashboard/projects/project-form.tsx 参照
  const [status, setStatus] = useState('lead')
  formData.set('status', status)
  ```
- バリデーションは Zod でなくブラウザ標準 `required` 属性使用（現状）

### レイアウト構造
- `app/dashboard/dashboard-layout.tsx`: サイドバーナビ + ヘッダー + ユーザードロップダウン
- 新規ページ追加時は `navigation` 配列に追加
- 権限別表示: `user.role === 'admin'` で分岐

## 開発ワークフロー

### ローカル起動
```bash
npm run dev  # http://localhost:3000
```

### データベース変更
1. `supabase/schema.sql` を編集
2. Supabase ダッシュボードの SQL Editor で実行
3. `lib/database.types.ts` を手動更新（型定義同期）

### デプロイ（Vercel）
- `main` ブランチへの push で自動デプロイ
- 環境変数 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 必須

### サーバー再起動
```bash
pkill -f "next dev"  # 既存プロセス終了
npm run dev
```

## コーディング規約

### TypeScript
- `lib/database.types.ts` の型を厳密に使用
- Server Actions の戻り値: `Promise<{ error?: string, success?: boolean } | void>`

### 命名規則
- ファイル名: kebab-case (`project-form.tsx`)
- コンポーネント: PascalCase (`ProjectForm`)
- Server Actions: camelCase (`createProject`)

### import パス
- エイリアス `@/` でルート参照（`@/lib/supabase/server`）
- 相対パスは同階層のみ使用

## 実装時の注意点

### パフォーマンス
- ダッシュボードは `export const dynamic = 'force-dynamic'` で毎回再取得
- リスト系は将来的にページネーション実装予定（現状は全件取得）

### セキュリティ
- RLS ポリシーでサーバー側制御済み
- ユーザー入力は `formData.get()` で自動サニタイズ
- 数値変換は `parseFloat()`, `parseInt()` で明示的に実行

### 未実装機能（TODO）
- Excel/CSV エクスポート機能
- グラフ描画（recharts 導入済みだが未使用）
- ユーザー管理画面（管理者向け）
- サインアップフォーム（現状は Supabase ダッシュボードから手動作成）

## トラブルシューティング

### RLS エラー発生時
1. `public.users` テーブルにレコード存在確認
2. `auth.users` の UUID と `public.users.id` が一致確認
3. SQL Editor で RLS ポリシー有効化確認: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`

### モックモードに切り替え
```bash
# .env.local に追加
USE_MOCK_DATA=true
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 型エラー対処
- Supabase クエリの型推論が不完全な場合は `as any` で回避（一時的）
- `lib/database.types.ts` を最新スキーマと同期

## 参考ファイル
- 完全な要件定義: `docs/REQUIREMENTS.md`
- セットアップ手順: `docs/SETUP.md`
- スキーマ定義: `supabase/schema.sql`
- Server Actions 実装例: `app/actions/projects.ts`
- フォームパターン: `app/dashboard/projects/project-form.tsx`
- ダッシュボード集計ロジック: `app/dashboard/page.tsx`
