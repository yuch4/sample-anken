# セットアップガイド

このガイドでは、営業案件管理システムを初めてセットアップする手順を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- npm または yarn がインストールされていること
- Supabaseアカウント（無料で作成可能）

## ステップ1: リポジトリのクローンと依存関係のインストール

```bash
cd /path/to/sample-anken
npm install
```

## ステップ2: Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 「New Project」をクリックして新しいプロジェクトを作成
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで数分待ちます

## ステップ3: Supabase認証情報の取得

1. Supabaseダッシュボードで、作成したプロジェクトを開く
2. 左サイドバーから「Project Settings」→「API」を選択
3. 以下の情報をコピー：
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## ステップ4: 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下を記入：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## ステップ5: データベーススキーマの作成

1. Supabaseダッシュボードの左サイドバーから「SQL Editor」を選択
2. 「New Query」をクリック
3. `supabase/schema.sql`ファイルの内容をすべてコピーして貼り付け
4. 「Run」ボタンをクリックして実行

これにより以下が作成されます：
- `users`テーブル
- `projects`テーブル
- `activities`テーブル
- `monthly_targets`テーブル
- 必要なインデックス
- Row Level Security (RLS) ポリシー

## ステップ6: 初期ユーザーの作成

### 方法1: Supabaseダッシュボードから作成（推奨）

1. Supabaseダッシュボードの「Authentication」→「Users」を選択
2. 「Add User」→「Create new user」をクリック
3. メールアドレスとパスワードを入力して作成
4. 作成されたユーザーのUUIDをコピー
5. 「SQL Editor」で以下のSQLを実行：

```sql
INSERT INTO public.users (id, email, name, role)
VALUES (
  'コピーしたUUID',
  'admin@example.com',
  '管理者',
  'admin'
);
```

### 方法2: SQLで一括作成

```sql
-- 1. Authユーザーを作成（パスワードは自動でハッシュ化されます）
-- Supabaseダッシュボードから手動で作成することを推奨

-- 2. usersテーブルに追加（UUIDは上記で作成したユーザーのIDを使用）
INSERT INTO public.users (id, email, name, role) VALUES
('uuid-from-auth-users', 'admin@example.com', '管理者', 'admin'),
('uuid-from-auth-users', 'user@example.com', '営業担当', 'user');
```

## ステップ7: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ステップ8: ログインしてシステムを確認

1. ログインページが表示されるので、作成したユーザーでログイン
2. ダッシュボードが表示されることを確認
3. 案件を登録してみる
4. 目標を設定してみる

## トラブルシューティング

### ログインできない

- `.env.local`の設定が正しいか確認
- SupabaseのAuthでユーザーが作成されているか確認
- `users`テーブルにもレコードが存在するか確認

### データベース接続エラー

- Supabase URLとAnon Keyが正しいか確認
- Supabaseプロジェクトが起動しているか確認（無料プランは一定期間使用しないと停止します）

### RLSエラーが発生する

- `supabase/schema.sql`が正しく実行されたか確認
- RLSポリシーが正しく設定されているか確認

```sql
-- RLSが有効になっているか確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- ポリシーが存在するか確認
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

## 次のステップ

- サンプルデータを登録して動作を確認
- 実際の営業データを入力
- チームメンバーを追加
- Vercelにデプロイして本番環境を構築

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [shadcn/ui ドキュメント](https://ui.shadcn.com)
