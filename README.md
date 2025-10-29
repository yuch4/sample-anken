# 営業案件管理システム (Sales Pipeline Manager)

営業チームの案件管理と数字管理を一元化するWebアプリケーションです。

## 主な機能

### ✅ 完全実装済み機能

- **ダッシュボード**: 
  - 売上実績、予算比、案件数のKPI表示
  - 月次売上推移グラフ（過去6ヶ月）
  - カテゴリ別売上円グラフ
  - ステータス別案件分析棒グラフ
  - 担当者別実績テーブル
  
- **案件管理**: 
  - 案件の作成・編集・削除（論理削除）
  - 案件詳細表示と活動履歴
  - 高度な絞り込み機能（キーワード検索、ステータス、カテゴリ、担当者）
  - Excel/CSVエクスポート機能
  
- **目標管理**: 月次の売上・粗利目標の設定・編集

- **ユーザー管理** (管理者のみ):
  - ユーザーの追加・編集・削除
  - 役割管理（管理者/マネージャー/営業）

- **認証**: 
  - Supabase Authによるセキュアなログイン
  - サインアップフォーム
  
- **モックデータモード**: Supabase接続なしで動作する開発モード

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript
- **UIライブラリ**: shadcn/ui + Tailwind CSS 4
- **グラフ**: Recharts
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **エクスポート**: xlsx
- **日付処理**: date-fns (日本語ロケール対応)
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
# 本番環境の場合
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 開発環境でモックデータを使う場合
USE_MOCK_DATA=true
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**モックデータモード**を使用すると、Supabase接続なしで開発できます：
- 4名のモックユーザー（管理者、マネージャー、営業×2）
- 10件の案件データ（全ステータスを網羅）
- 活動履歴と月次目標データ
- ログイン: `admin@example.com` / パスワード任意

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

**モックモードの場合**:
- メールアドレス: `admin@example.com`
- パスワード: 任意（`password`など）

**本番モードの場合**:
初回は、アプリケーション上で [http://localhost:3000/signup](http://localhost:3000/signup) からサインアップするか、
Supabaseダッシュボードの「Authentication」→「Users」から手動でユーザーを作成してください。

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
│   │   ├── auth.ts       # 認証処理（ログイン・サインアップ）
│   │   ├── projects.ts   # 案件管理
│   │   ├── targets.ts    # 目標管理
│   │   └── users.ts      # ユーザー管理
│   ├── dashboard/        # ダッシュボード関連ページ
│   │   ├── page.tsx      # ダッシュボード（KPI・グラフ）
│   │   ├── projects/     # 案件管理
│   │   ├── targets/      # 目標設定
│   │   └── users/        # ユーザー管理（管理者のみ）
│   ├── login/            # ログインページ
│   ├── signup/           # サインアップページ
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ルートページ（リダイレクト）
├── components/
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── dashboard/        # ダッシュボード用グラフコンポーネント
│   ├── projects/         # 案件管理用コンポーネント
│   └── users/            # ユーザー管理用コンポーネント
├── lib/
│   ├── supabase/         # Supabaseクライアント設定
│   ├── database.types.ts # データベース型定義
│   ├── mock-data.ts      # モックデータ
│   ├── mock-supabase.ts  # モックSupabaseクライアント
│   ├── export-utils.ts   # Excel/CSVエクスポート
│   └── utils.ts          # ユーティリティ関数
├── supabase/
│   ├── schema.sql        # データベーススキーマ
│   └── sample-data.sql   # サンプルデータ（任意）
├── docs/
│   ├── REQUIREMENTS.md   # 要件定義書
│   └── SETUP.md          # セットアップガイド
└── middleware.ts         # 認証ミドルウェア
```

## データモデル

### users（ユーザー）
- 基本情報: email, name, role (sales/manager/admin)
- 権限:
  - **sales（営業）**: 全案件閲覧可、自分の案件のみ編集可
  - **manager（マネージャー）**: 全案件編集可、目標設定可
  - **admin（管理者）**: 全機能利用可、ユーザー管理可

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

## よくある質問

**Q: Supabaseなしで開発できますか？**
A: はい、`.env.local`に`USE_MOCK_DATA=true`を設定することで、モックデータモードで動作します。

**Q: グラフが表示されません**
A: Rechartsの警告が出る場合がありますが、実際にはグラフは表示されます。ブラウザのコンソールを確認してください。

**Q: エクスポート機能が動作しません**
A: クライアントコンポーネントでのみ動作します。案件一覧ページの「エクスポート」ボタンからお試しください。

**Q: ユーザー管理画面が見えません**
A: 管理者（role='admin'）のみアクセス可能です。モックモードでは`admin@example.com`でログインしてください。

## トラブルシューティング

**開発サーバーが起動しない**
```bash
# プロセスを停止してから再起動
pkill -f "next dev"
npm run dev
```

**型エラーが出る**
- `lib/database.types.ts`とSupabaseのスキーマが一致しているか確認
- TypeScriptの厳密チェックで一部`any`型を使用している箇所があります

**RLSエラー**
- `public.users`テーブルにレコードが存在するか確認
- `auth.users`のUUIDと`public.users.id`が一致しているか確認

## ライセンス

MIT

## 開発者

詳細は `docs/REQUIREMENTS.md` と `docs/SETUP.md` を参照してください。

