# 営業案件管理システム (Sales Pipeline Manager)

営業チームの案件管理と数字管理を一元化するWebアプリケーションです。

## 主な機能

- **ダッシュボード**: 売上実績、予算比、案件数の可視化
- **案件管理**: 案件の作成・編集・削除、活動履歴の記録
- **目標管理**: 月次の売上・粗利目標の設定
- **認証**: Supabase Authによるセキュアなログイン

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript
- **UIライブラリ**: shadcn/ui + Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ホスティング**: Vercel

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURL・Anon Keyを取得

### 3. 環境変数の設定

`.env.local`ファイルにSupabaseの認証情報を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. データベーススキーマの作成

Supabaseダッシュボードの「SQL Editor」で、`supabase/schema.sql`の内容を実行してください。

このSQLファイルには以下が含まれています：
- テーブル定義（users, projects, activities, monthly_targets）
- インデックス
- Row Level Security (RLS) ポリシー

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 6. 初回ログイン

初回は、Supabaseダッシュボードの「Authentication」→「Users」から手動でユーザーを作成するか、
アプリケーション上でサインアップしてください（まだサインアップフォームは未実装なので、Supabase経由で作成推奨）。

ユーザー作成後、`users`テーブルにもレコードを追加する必要があります：

```sql
INSERT INTO public.users (id, email, name, role)
VALUES ('ユーザーのUUID', 'user@example.com', 'ユーザー名', 'admin');
```

## プロジェクト構成

```
sample-anken/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── auth.ts       # 認証処理
│   │   ├── projects.ts   # 案件管理
│   │   └── targets.ts    # 目標管理
│   ├── dashboard/        # ダッシュボード関連ページ
│   │   ├── page.tsx      # ダッシュボード
│   │   ├── projects/     # 案件管理
│   │   └── targets/      # 目標設定
│   ├── login/            # ログインページ
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ルートページ（リダイレクト）
├── components/
│   └── ui/               # shadcn/ui コンポーネント
├── lib/
│   ├── supabase/         # Supabaseクライアント設定
│   ├── database.types.ts # データベース型定義
│   └── utils.ts          # ユーティリティ関数
├── supabase/
│   └── schema.sql        # データベーススキーマ
├── docs/
│   └── REQUIREMENTS.md   # 要件定義書
└── middleware.ts         # 認証ミドルウェア
```

## データモデル

### users（ユーザー）
- 基本情報: email, name, role (user/manager/admin)

### projects（案件）
- 企業名、担当者、ステータス（リード/商談/提案/受注/失注）
- 売上金額、粗利金額、確度
- カテゴリ、受注予定月、計上予定月
- 担当者ID

### activities（活動履歴）
- 案件IDに紐づく活動記録
- 活動種別（訪問/電話/メール/商談）
- 活動内容、活動日時

### monthly_targets（月次目標）
- 対象月、売上目標、粗利目標
- 全体目標（user_id = NULL）または個人目標

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにコードをプッシュ
2. Vercelで新しいプロジェクトをインポート
3. 環境変数を設定（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
4. デプロイ

## ライセンス

MIT

## 開発者

詳細は `docs/REQUIREMENTS.md` を参照してください。

